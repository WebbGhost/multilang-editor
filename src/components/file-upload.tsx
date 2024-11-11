import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => Promise<void>;
  isProcessing: boolean;
  accept?: Record<string, string[]>;
  label: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  isProcessing,
  accept = {
    'application/json': ['.json']
  },
  label
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles?.[0]) {
        await onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-lg border-2 border-dashed border-slate-800',
        'p-8 text-center transition-all duration-200 ease-in-out',
        'hover:border-slate-700 hover:bg-slate-900/50',
        isDragActive && 'border-slate-600 bg-slate-900/50',
        isProcessing && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        {isProcessing ? (
          <Loader2 className="h-10 w-10 text-slate-500 animate-spin" />
        ) : (
          <Upload className="h-10 w-10 text-slate-500" />
        )}
        <div className="space-y-2">
          <p className="text-sm text-slate-300">{label}</p>
          <p className="text-xs text-slate-500">
            Drop your JSON file here or click to browse
          </p>
        </div>
      </div>
    </div>
  );
};
