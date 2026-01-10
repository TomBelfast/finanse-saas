import React, { FunctionComponent, memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import last from 'lodash.last';
import { useTranslation } from 'react-i18next';
import { FileUpload } from '~/components/ui/file-upload';
import { logger } from '~/utils/logger';

interface OwnProps {
  storageRef: string;
  onChange?: (urls: { url: string; name: string; uid: string }[]) => void;
  fileList?: { url: string; name: string; uid: string }[];
  multiple?: boolean;
  readonly?: boolean;
}

type Props = OwnProps;

interface FileWithUrl {
  file?: File;
  url: string;
  name: string;
  uid: string;
  size?: number;
  status: 'done' | 'error' | 'uploading';
}

const customBeforeUpload = (file: File, limitInMB = 4000) => {
  const validationType =
    file.type === 'application/pdf' ||
    file.type === 'image/jpg' ||
    file.type === 'image/gif' ||
    file.type === 'image/png';
  const extension = last(file.name.split('.'));
  const allowedExtension = [
    'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'mp3', 'mp4', 'csv', 'zip', 'jpg', 'jpeg', 'mobi', 'epub',
  ];
  if (!extension || (!validationType && !allowedExtension.includes(extension))) {
    toast.error(
      'Rozszerzenie pliku jest niedopuszczalne, wyślij plik w formacie jpg/gif/png/pdf/mobi/epub/txt/doc/docx/xls/xlsx/ppt/pptx/mp3/mp4/csv/zip.'
    );
    return false;
  }
  const isToLarge = file.size / 1024 / 1024 > limitInMB;
  if (isToLarge) {
    toast.error(`Plik nie może być większy niż ${limitInMB}MB.`);
    return false;
  }

  return true;
};

const UploadDragger: FunctionComponent<Props> = ({
  storageRef,
  onChange,
  fileList: defaultFileList,
  multiple,
  readonly,
}) => {
  const { t } = useTranslation('common');

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
          }) as FileWithUrl
      );
    }
    return [];
  });

  useEffect(() => {
    onChange?.(
      fileList
        .filter((item) => item.status === 'done' && item.url)
        .map((item) => ({ url: item.url, name: item.name, uid: item.uid }))
    );
  }, [fileList]);

  const handleFiles = (files: File[]) => {
    // Validate each file
    const validFiles = files.filter(f => customBeforeUpload(f));

    // Add to list and simulate upload (fail)
    validFiles.forEach(file => {
      const uid = Math.random().toString(36).substring(7);

      // Init as uploading (or direct error since disabled)
      updateFileList(prev => [...prev, {
        file,
        url: '',
        name: file.name,
        uid,
        status: 'uploading'
      }]);

      logger.error('File upload is currently disabled due to Firebase removal', new Error('Firebase removed'));
      setTimeout(() => {
        toast.error('File upload disabled');
        updateFileList((prev) =>
          prev.map((savedFile) => {
            if (savedFile.uid === uid) {
              return {
                ...savedFile,
                status: 'error',
              };
            }
            return savedFile;
          })
        );
      }, 500);
    });
  };

  interface FileItem {
    uid: string;
    name: string;
    url?: string;
    type?: string;
  }

  const onRemove = (fileToRemove: File | FileItem) => {
    const uid = 'uid' in fileToRemove ? fileToRemove.uid : undefined;
    if (uid) {
      updateFileList((prev) =>
        prev.filter((savedFile) => savedFile.uid !== uid)
      );
    }
  };

  if (readonly && fileList.length === 0) return null;

  return (
    <FileUpload
      onFileSelect={handleFiles}
      onRemove={onRemove as (file: File | FileItem) => void}
      multiple={multiple}
      disabled={readonly}
      className={readonly ? 'hidden' : ''}
      fileList={fileList.map(f => ({ name: f.name, uid: f.uid, url: f.url }))}
    />
  );
};

export default memo(UploadDragger);
