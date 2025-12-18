import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { cn } from '~/lib/utils'

export interface RcCustomRequestOptions {
  onProgress: (event: { percent: number }, file: File) => void
  onError: (error: Error, response?: unknown, file?: File) => void
  onSuccess: (response: object, file: File) => void
  file: File
}

interface OwnProps {
  storageRef: string
  onChange?: (urls: string[]) => void
  fileList?: string[]
  multiple?: boolean
  withCrop?: boolean
  disabled?: boolean
  shouldRemovePermanently?: boolean
}

type Props = OwnProps

const ImageUploadField: FunctionComponent<Props> = ({
  storageRef,
  onChange,
  fileList: defaultFileList,
  multiple,
  withCrop = true,
  disabled = false,
  shouldRemovePermanently = true,
}) => {
  const { t } = useTranslation('common')
  const [fileList, setFileList] = useState<string[]>([])
  const [preview, setPreviewImg] = useState<string | null>(null)

  useEffect(() => {
    if (defaultFileList && defaultFileList.length) {
      setFileList(defaultFileList)
    } else {
      setFileList([])
    }
  }, [defaultFileList])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const validationType = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'].includes(file.type)

    if (!validationType) {
      toast.error('Rozszerzenie pliku jest niedopuszczalne, wyślij zdjęcie w formacie jpg/gif/png')
      return
    }

    const isLt1M = file.size / 1024 / 1024 < 1
    if (!isLt1M) {
      toast.error('Zdjęcie nie może być większe niż 1MB')
      return
    }

    toast.error('File upload is currently disabled due to Firebase removal.')
    // Here we would normally upload
  }

  const handleRemove = (urlToRemove: string) => {
    const newList = fileList.filter(url => url !== urlToRemove)
    setFileList(newList)
    onChange?.(newList)
  }

  return (
    <div className="flex flex-wrap gap-4">
      {fileList.map((url, index) => (
        <div key={index} className="group relative h-24 w-24 overflow-hidden rounded-md border">
          <img
            src={url}
            alt={`preview ${index}`}
            className="h-full w-full object-cover transition-opacity hover:opacity-75 cursor-pointer"
            onClick={() => setPreviewImg(url)}
          />
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(url)
              }}
              className="absolute right-1 top-1 rounded-full bg-destructive/80 p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      {(!multiple && fileList.length >= 1) ? null : (
        <label className={cn(
          "flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed hover:bg-muted/50 transition-colors",
          disabled && "cursor-not-allowed opacity-50"
        )}>
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="mt-2 text-xs text-muted-foreground">Upload</span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/gif,image/png"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreviewImg(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Podgląd</DialogTitle>
          </DialogHeader>
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ImageUploadField
