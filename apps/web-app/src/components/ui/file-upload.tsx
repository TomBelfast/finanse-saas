import React, { useRef, useState } from 'react';
import { cn } from '~/lib/utils';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { Button } from './button';

interface FileItem {
  name: string;
  url?: string;
  uid?: string;
}

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    onRemove?: (file: File | FileItem) => void;
    multiple?: boolean;
    accept?: string;
    className?: string;
    disabled?: boolean;
    maxSizeInMB?: number;
    files?: File[];
    fileList?: FileItem[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    onRemove,
    multiple = false,
    accept,
    className,
    disabled = false,
    maxSizeInMB = 5,
    files = [],
    fileList
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const validateFile = (file: File): boolean => {
        if (maxSizeInMB && file.size > maxSizeInMB * 1024 * 1024) {
            setError(`Plik ${file.name} jest za duży (max ${maxSizeInMB}MB)`);
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(validateFile);

        if (validFiles.length > 0) {
            if (!multiple) {
                onFileSelect([validFiles[0]]);
            } else {
                onFileSelect(validFiles);
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(validateFile);

            if (validFiles.length > 0) {
                onFileSelect(validFiles);
            }
        }
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                    isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed hover:border-muted-foreground/25",
                    error && "border-destructive/50"
                )}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    onChange={handleFileInput}
                    multiple={multiple}
                    accept={accept}
                    disabled={disabled}
                />
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <UploadCloud className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">
                    Kliknij lub upuść pliki tutaj
                </p>
                <p className="text-xs text-muted-foreground">
                    {accept ? `Formaty: ${accept}` : 'Wszystkie formaty'} (max {maxSizeInMB}MB)
                </p>
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
            </div>

            {(files.length > 0 || (fileList && fileList.length > 0)) && (
                <div className="mt-4 space-y-2">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-background">
                            <div className="flex items-center space-x-2 truncate">
                                <FileIcon className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-destructive"
                                onClick={() => onRemove?.(file)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {fileList?.map((file, i) => (
                        <div key={file.uid || i} className="flex items-center justify-between p-2 border rounded-md bg-background">
                            <div className="flex items-center space-x-2 truncate">
                                <FileIcon className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            </div>
                            {onRemove && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:text-destructive"
                                    onClick={() => onRemove(file)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
