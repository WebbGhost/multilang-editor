
// App.tsx
import React, { useCallback, useState } from 'react';
import { 
  Globe, 
  Trash2, 
  LayoutDashboard, 
  Files, 
  Settings,
  ChevronDown,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePreview } from './components/file-preview';
import { FileDropzone } from './components/file-upload';
import { useTranslatorStore } from './store/useFileStore';
import Editor from './editor';

const Navigation = ({onActiveKeyChange,activeKey}:{
  onActiveKeyChange:(n:number)=>void,
  activeKey:number
}) => (
  <div className="hidden border-r border-slate-800 md:block md:w-64 lg:w-72">
    <div className="flex h-full overflow-hidden flex-col px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <Globe className="h-6 w-6 text-blue-500" />
        <span className="font-semibold">JSON Translator</span>
      </div>

      {/* Nav Links */}
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <Button 
          variant="ghost" 
          className={`w-full hover:bg-slate-900 hover:text-white justify-start gap-2 ${activeKey === 1 ? 'bg-slate-900/40': ''}`}
          onClick={()=> onActiveKeyChange(1) }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full hover:bg-slate-900 hover:text-white justify-start gap-2 ${activeKey === 2 ? 'bg-slate-900/40': ''}`}
          onClick={()=>{
            onActiveKeyChange(2)
          }}
        >
          <Files className="h-4 w-4" />
          Editor
        </Button>
        {/* <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button> */}
      </nav>
    </div>
  </div>
);

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
    <div className="flex h-16 items-center gap-4 px-4">
      <div className="flex flex-1 items-center justify-end gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-slate-400 hover:text-slate-50"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-slate-400 hover:text-slate-50">
              <User className="h-5 w-5" />
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
);

export default function App() {
  const [activeKey,setActiveKey] = useState(1)
  const files = useTranslatorStore((state) => state.files);
  const isProcessing = useTranslatorStore((state) => state.isProcessing);
  const error = useTranslatorStore((state) => state.error);
  const setFile = useTranslatorStore((state) => state.setFile);
  const setProcessing = useTranslatorStore((state) => state.setProcessing);
  const setError = useTranslatorStore((state) => state.setError);
  const reset = useTranslatorStore((state) => state.reset);

  const handleFileSelect = useCallback(
    async (type: 'source' | 'target', file: File) => {
      setProcessing(true);
      setError(null);

      try {
        const text = await file.text();
        const content = JSON.parse(text);

        setFile(type, {
          name: file.name,
          content,
          lastModified: file.lastModified
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to process JSON file'
        );
      } finally {
        setProcessing(false);
      }
    },
    [setFile, setProcessing, setError]
  );
  const onActiveKeyChange = (n:number)=>{
    setActiveKey(n)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-slate-50">
      <div className="flex h-screen overflow-hidden">
        <Navigation onActiveKeyChange={onActiveKeyChange} activeKey={activeKey}/>
        
        <div className="flex-1 overflow-y-scroll">
          <Header />
          {
            activeKey === 1 &&
          
          <main className="h-[calc(100vh-4rem)] overflow-y-auto p-8">
            <div className="mx-auto max-w-6xl">
              {/* Page Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-sm text-slate-400">
                    Manage and translate your JSON files
                  </p>
                </div>

                {(files.source || files.target) && (
                  <Button
                    variant="destructive"
                    onClick={reset}
                    className="bg-red-950 hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Files
                  </Button>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-900 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-slate-400 text-sm font-medium">Files</div>
                  <div className="mt-2 text-2xl font-bold">
                    {Object.values(files).filter(Boolean).length}/2
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-slate-400 text-sm font-medium">Status</div>
                  <div className="mt-2 text-2xl font-bold">
                    {isProcessing ? 'Processing' : 'Ready'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-slate-400 text-sm font-medium">Translation Keys</div>
                  <div className="mt-2 text-2xl font-bold">
                    {files.source ? Object.keys(files.source.content).length : 0}
                  </div>
                </div>
              </div>

              {/* File Upload Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-200">Source File</h3>
                  {files.source ? (
                    <FilePreview
                      file={files.source}
                      onRemove={() => setFile('source', null)}
                      title="Source JSON"
                      description="Your source language file"
                    />
                  ) : (
                    <FileDropzone
                      onFileSelect={(file) => handleFileSelect('source', file)}
                      isProcessing={isProcessing}
                      label="Upload Source File"
                    />
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-200">Target File</h3>
                  {files.target ? (
                    <FilePreview
                      file={files.target}
                      onRemove={() => setFile('target', null)}
                      title="Target JSON"
                      description="Your target language file"
                    />
                  ) : (
                    <FileDropzone
                      onFileSelect={(file) => handleFileSelect('target', file)}
                      isProcessing={isProcessing}
                      label="Upload Target File"
                    />
                  )}
                </div>
              </div>
            </div>
          </main>}
          {
            activeKey === 2 && <Editor/>
          }
        </div>
      </div>
    </div>
  );
}
