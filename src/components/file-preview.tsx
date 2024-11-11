import React from 'react';
import { File, X } from 'lucide-react';
import { JsonFile } from '../types/index';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface FilePreviewProps {
  file: JsonFile;
  onRemove: () => void;
  title: string;
  description: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  title,
  description
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-slate-200">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {description}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-300"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3 text-sm text-slate-400 mb-3">
          <File className="h-4 w-4" />
          <span>{file.name}</span>
        </div>
        <div className="rounded-md bg-slate-950 p-4 max-h-[300px] overflow-auto">
          <pre className="text-xs text-slate-300">
            {JSON.stringify(file.content, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
