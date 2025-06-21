"use client";

import React, { useState } from 'react';
import { Folder, Plus, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { toast } from '@/hooks/use-toast';

export interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
  thumbnail?: string;
  createdAt: Date;
  isDefault?: boolean;
}

interface FolderManagerProps {
  folders: MediaFolder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onSelectFolder: (folder: MediaFolder | null) => void;
  selectedFolder: MediaFolder | null;
  isDarkMode: boolean;
}

const FolderManager: React.FC<FolderManagerProps> = ({
  folders,
  onCreateFolder,
  onDeleteFolder, 
  onRenameFolder,
  onSelectFolder,
  selectedFolder,
  isDarkMode
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateDialogOpen(false);
      toast({
        title: "Album created",
        description: `"${newFolderName}" has been created.`,
      });
    }
  };

  const handleRenameFolder = (id: string) => {
    if (editName.trim()) {
      onRenameFolder(id, editName.trim());
      setEditingFolder(null);
      setEditName('');
      toast({
        title: "Album renamed",
        description: "Album has been renamed successfully.",
      });
    }
  };

  const handleDeleteFolder = (id: string) => {
    onDeleteFolder(id);
    toast({
      title: "Album deleted",
      description: "Album has been deleted.",
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Albums</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Organize your media into collections
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Album
            </Button>
          </DialogTrigger>
          <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle className={isDarkMode ? 'text-white' : ''}>Create New Album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Album name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateFolder} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  className={`flex-1 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* "All" folder - find the default folder from the API or create one */}
        {folders.find(folder => folder.id === 'all-photos') ? (
          // Use the folder from the API
        <div 
          className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedFolder?.id === 'all-photos' || !selectedFolder
              ? `border-2 border-blue-500 shadow-lg ${isDarkMode ? 'bg-blue-900/20 shadow-blue-500/20' : 'bg-blue-50 shadow-blue-100'}` 
              : `border-2 ${isDarkMode ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-gray-50'}`
          }`}
            onClick={() => onSelectFolder(folders.find(folder => folder.id === 'all-photos') || null)}
        >
          <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl mb-3 shadow-lg">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className={`font-semibold text-sm text-center mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              All
          </h3>
          <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {folders.find(folder => folder.id === 'all-photos')?.itemCount || 0} items
          </p>
        </div>
        ) : null}

        {folders.filter(folder => folder.id !== 'all-photos').map((folder) => (
          <ContextMenu key={folder.id}>
            <ContextMenuTrigger>
              <div 
                className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedFolder?.id === folder.id 
                    ? `border-2 border-blue-500 shadow-lg ${isDarkMode ? 'bg-blue-900/20 shadow-blue-500/20' : 'bg-blue-50 shadow-blue-100'}` 
                    : `border-2 ${isDarkMode ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-gray-50'}`
                }`}
                onClick={() => onSelectFolder(folder)}
              >
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-xl mb-3 overflow-hidden shadow-inner">
                  {folder.thumbnail ? (
                    <img 
                      src={folder.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Folder className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                {editingFolder === folder.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder(folder.id)}
                    onBlur={() => handleRenameFolder(folder.id)}
                    className={`h-6 text-sm text-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    autoFocus
                  />
                ) : (
                  <h3 className={`font-semibold text-sm text-center mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {folder.name}
                  </h3>
                )}
                <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {folder.itemCount} items
                </p>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <ContextMenuItem 
                onClick={() => {
                  setEditingFolder(folder.id);
                  setEditName(folder.name);
                }}
                className={isDarkMode ? 'text-gray-200 hover:bg-gray-700' : ''}
              >
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleDeleteFolder(folder.id)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
};

export default FolderManager;
