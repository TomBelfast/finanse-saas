import React, { FunctionComponent, memo, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import last from 'lodash.last';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { logger } from '~/utils/logger';

interface OwnProps {
  storageRef: string;
  onChange?: (urls: { url: string; name: string; uid: string; type: string }[]) => void;
  fileList?: { url: string; name: string; uid: string }[];
  multiple?: boolean;
  inProgress?: () => void;
  onFinish?: () => void;
}

type Props = OwnProps;

interface FileWithUrl {
  file?: File;
  url: string;
  name: string;
  uid: string;
  status: 'done' | 'error' | 'uploading';
  type: string;
}

const customBeforeUpload = (file: File, limitInMB = 40) => {
  const validationType =
    file.type === 'application/pdf' ||
    file.type === 'image/jpg' ||
    file.type === 'image/gif' ||
    file.type === 'image/png';
  const extension = last(file.name.split('.'));
  const allowedExtension = [
    'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'mp3', 'mp4', 'csv', 'zip', 'jpg', 'jpeg'
  ];
  if (!extension || (!validationType && !allowedExtension.includes(extension))) {
    toast.error('Rozszerzenie pliku jest niedopuszczalne.');
    return false;
  }
  const isToLarge = file.size / 1024 / 1024 > limitInMB;
  if (isToLarge) {
    toast.error(`Plik nie może być większy niż ${limitInMB}MB.`);
    return false;
  }
  return true;
};

const UploadField: FunctionComponent<Props> = ({
  storageRef,
  onChange,
  fileList: defaultFileList,
  multiple,
  inProgress,
  onFinish,
}) => {
  const { t } = useTranslation(['content', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileList, updateFileList] = useState<FileWithUrl[]>(() => {
    if (defaultFileList?.length) {
      return defaultFileList.map(
        (item) =>
          ({
            url: item.url,
            name: item.name,
            size: 0,
            uid: item.uid || Math.random().toString(36).substring(7),
            status: 'done',
            type: '',
          }) as FileWithUrl
      );
    }
    return [];
  });

  useEffect(() => {
    onChange?.(
      fileList
        .filter((item) => item.status === 'done' && item.url)
        .map((item) => ({
          url: item.url,
          name: item.name,
          uid: item.uid,
          type: item.type || '',
        }))
    );

    if (onFinish && fileList.length > 0 && fileList.every((file) => file.status === 'done' || file.status === 'error')) {
      setTimeout(() => onFinish(), 0);
    }

    if (inProgress && fileList.some((file) => file.status === 'uploading')) {
      inProgress();
    }
  }, [fileList]);

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && 'VITE_API_URL' in window && typeof (window as { VITE_API_URL?: string }).VITE_API_URL === 'string') {
      return (window as { VITE_API_URL: string }).VITE_API_URL;
    }
    const hostname = window?.location?.hostname || 'localhost';
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3015/api`;
    }
    return 'http://localhost:3015/api';
  };

  const uploadFile = async (file: File) => {
    const uid = Math.random().toString(36).substring(7);

    updateFileList(prev => [...prev, {
      file,
      url: '',
      name: file.name,
      uid,
      status: 'uploading',
      type: file.type
    }]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          const response = await fetch(`${getApiBaseUrl()}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              data: base64Data,
              entityType: storageRef.split('/')[0] || 'general',
              entityId: storageRef.split('/')[1] || 'general',
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
          }

          const result = await response.json();
          const uploadedFile = result.data;
          const fullUrl = `${getApiBaseUrl()}/upload/${uploadedFile.id}`;

          updateFileList((prev) =>
            prev.map((savedFile) => {
              if (savedFile.uid === uid) {
                return {
                  ...savedFile,
                  status: 'done',
                  url: fullUrl,
                };
              }
              return savedFile;
            })
          );
        } catch (err) {
          logger.error('Upload error', err instanceof Error ? err : new Error(String(err)), { fileName: file.name });
          toast.error('Błąd przesyłania pliku');
          updateFileList((prev) =>
            prev.map((savedFile) => {
              if (savedFile.uid === uid) {
                return { ...savedFile, status: 'error' };
              }
              return savedFile;
            })
          );
        }
      };

      reader.onerror = () => {
        toast.error('Błąd odczytu pliku');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      logger.error('Upload setup error', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => customBeforeUpload(f));
      validFiles.forEach(uploadFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onRemove = async (file: FileWithUrl) => {
    const url = file.url || '';
    const fileId = url.includes('/upload/') ? url.split('/upload/')[1] : null;

    if (fileId) {
      try {
        await fetch(`${getApiBaseUrl()}/upload/${fileId}`, { method: 'DELETE' });
      } catch (err) {
        logger.warn('Failed to delete file from server', { error: err instanceof Error ? err.message : String(err), fileId });
      }
    }

    updateFileList((prev) =>
      prev.filter((savedFile) => savedFile.uid !== file.uid)
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        multiple={multiple}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {t<string>('common:button.upload')}
        </Button>
      </div>

      {fileList.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {fileList.map((f) => (
            <div key={f.uid} className="flex items-center justify-between p-2 border rounded-md bg-background text-sm">
              <span className="truncate max-w-[200px] font-medium">{f.name}</span>
              <div className="flex items-center gap-2">
                {f.status === 'uploading' && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Wysyłanie...
                  </span>
                )}
                {f.status === 'error' && <span className="text-xs text-destructive font-medium">Błąd</span>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(f)}
                  type="button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(UploadField);
