/* eslint-disable @typescript-eslint/no-explicit-any */
// components/JsonTreeEditor/TreeView.tsx
import React from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslatorStore } from '@/store/useFileStore';
export interface TreeNode {
  key: string;
  value: never;
  path: string[];
  isObject: boolean;
  isExpanded?: boolean;
  children?: TreeNode[];
}
interface TreeViewProps {
  node: TreeNode;
  onToggle: (path: string[]) => void;
  onAdd: (path: string[], key: string, value: string | object) => void;
  onDelete: (path: string[]) => void;
  onEdit: (path: string[], value: string) => void;
  level?: number;
}

export const TreeView: React.FC<TreeViewProps> = ({
  node,
  onToggle,
  onAdd,
  onDelete,
  onEdit,
  level = 0
}) => {
  const [isAddingNode, setIsAddingNode] = React.useState(false);
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(''); 
  const [nodeType, setNodeType] = React.useState<'value' | 'object'>('value');
  const [validateWithGlobal, setValidateWithGlobal] = React.useState(false);

  const globalFile = useTranslatorStore(state => state.files.target);
  const currentFile = useTranslatorStore(state => state.files.source);

  // Function to check if key exists in global file
  const checkKeyInGlobal = (keyToCheck: string, currentPath: string[]): boolean => {
    if (!globalFile || !validateWithGlobal) return false;

    let currentObj = globalFile.content;
    for (const pathPart of currentPath) {
      if (currentObj[pathPart]) {
        currentObj = currentObj[pathPart];
      } else {
        return false;
      }
    }

    return keyToCheck in currentObj;
  };

  // Function to check if key exists in current file
  const checkKeyInCurrentFile = (keyToCheck: string, currentPath: string[]): boolean => {
    console.log(currentPath)
    if (!currentFile) return false;

    const searchForKey = (obj: any): boolean => {
      for (const key in obj) {
        if (key === keyToCheck) return true;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (searchForKey(obj[key])) return true;
        }
      }
      return false;
    };

    return searchForKey(currentFile.content);
  };

  // Function to check if value exists in current file
  const checkValueInCurrentFile = (valueToCheck: string): boolean => {
    if (!currentFile) return false;

    const searchForValue = (obj: any): boolean => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key] === valueToCheck) return true;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (searchForValue(obj[key])) return true;
        }
      }
      return false;
    };

    return searchForValue(currentFile.content);
  };

  const handleAdd = () => {
    const formattedKey = newKey.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Validate if key exists in global file
    if (checkKeyInGlobal(formattedKey, node.path)) {
      alert('This key already exists in the global file!');
      return;
    }

    // Validate if key exists anywhere in current file
    if (checkKeyInCurrentFile(formattedKey, node.path)) {
      alert('This key already exists somewhere in the current file!');
      return;
    }

    // If adding a value, check if it exists anywhere in current file
    if (nodeType === 'value' && checkValueInCurrentFile(newValue)) {
      alert('This value already exists somewhere in the current file!');
      return;
    }

    // Add either an empty object or value based on selection
    const newNode = nodeType === 'object' ? {} : newValue;
    onAdd(node.path, formattedKey, newNode);
    
    // Reset form
    setNewKey('');
    setNewValue('');
    setNodeType('value');
    setIsAddingNode(false);
  };

  const handleEdit = () => {
    // Check if the new value exists anywhere else in the file
    if (checkValueInCurrentFile(editValue)) {
      alert('This value already exists somewhere in the current file!');
      return;
    }

    onEdit(node.path, editValue);
    setIsEditing(false);
  };

  return (
    <div className="ml-4">
      {level === 0 && (
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox
            id="validateGlobal"
            checked={validateWithGlobal}
            onCheckedChange={(checked) => setValidateWithGlobal(checked as boolean)}
          />
          <label
            htmlFor="validateGlobal"
            className="text-sm text-slate-300 cursor-pointer"
          >
            Validate keys against global file
          </label>
        </div>
      )}

      <div className="flex items-center group">
        <div 
          className={cn(
            "flex items-center py-1 px-2 rounded-md hover:bg-slate-800/50 cursor-pointer flex-1",
            "transition-colors duration-200"
          )}
          onClick={() => node.isObject && onToggle(node.path)}
        >
          {node.isObject ? (
            node.isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400 mr-2" />
            )
          ) : (
            <div className="w-6" />
          )}
          
          <span className="text-sm font-medium text-slate-200">{node.key}</span>
          
          {!node.isObject && (
            <>
              <span className="mx-2 text-slate-500">:</span>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-6 text-sm bg-slate-900"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEdit}
                    className="h-6 px-2"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <span 
                  className="text-sm text-slate-400 cursor-text"
                  onClick={() => {
                    setEditValue(String(node.value));
                    setIsEditing(true);
                  }}
                >
                  {String(node.value)}
                </span>
              )}
            </>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1">
          {node.isObject && (
            <Dialog open={isAddingNode} onOpenChange={setIsAddingNode}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className='bg-slate-950 text-white'>
                <DialogHeader>
                  <DialogTitle>Add New Node</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Node Type</label>
                    <RadioGroup 
                      value={nodeType} 
                      onValueChange={(value: 'value' | 'object') => setNodeType(value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="value" id="value" />
                        <Label htmlFor="value">Key-Value</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="object" id="object" />
                        <Label htmlFor="object">Object</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Key</label>
                    <Input
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter key"
                    />
                  </div>
                  {nodeType === 'value' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Value</label>
                      <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-4">
                  <Button onClick={handleAdd} className="w-full">
                    Add Node
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(node.path)}
            className="h-6 w-6 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {node.isObject && node.isExpanded && node.children && (
        <div className="ml-4 border-l border-slate-800 max-h-[500px] overflow-y-auto">
          {node.children.map((child) => (
            <TreeView
              key={child.key}
              node={child}
              onToggle={onToggle}
              onAdd={onAdd}
              onDelete={onDelete}
              onEdit={onEdit}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
