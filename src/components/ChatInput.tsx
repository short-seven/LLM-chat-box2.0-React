import React, { useState } from 'react';
import sendIcon from '../assets/photo/发送.png';
import attachIcon from '../assets/photo/附件.png';
import imageIcon from '../assets/photo/图片.png';
import './ChatInput.scss';

interface File {
  name: string;
  url: string;
  type: 'image' | 'file';
  size: number;
}

interface ChatInputProps {
  loading: boolean;
  onSend: (message: { text: string; files: File[] }) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ loading, onSend }) => {
  const [inputValue, setInputValue] = useState('');
  const [fileList, setFileList] = useState<File[]>([]);

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;

    const messageContent = {
      text: inputValue.trim(),
      files: fileList,
    };

    onSend(messageContent);
    setInputValue('');
    setFileList([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow default behavior for newline
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileList([
      ...fileList,
      {
        name: file.name,
        url: URL.createObjectURL(file),
        type: type === 'image' || file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
      },
    ]);

    // Reset input
    event.target.value = '';
  };

  const handleFileRemove = (file: File) => {
    URL.revokeObjectURL(file.url);
    setFileList(fileList.filter((item) => item.url !== file.url));
  };

  return (
    <div className="chat-input-wrapper">
      {fileList.length > 0 && (
        <div className="preview-area">
          {fileList.map((file) => (
            <div key={file.url} className="preview-item">
              {file.type === 'image' ? (
                <div className="image-preview">
                  <img src={file.url} alt={file.name} />
                  <div className="remove-btn" onClick={() => handleFileRemove(file)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M9.5 3L3 9.5M3 3l6.5 6.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="file-preview">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
                  <div className="remove-btn" onClick={() => handleFileRemove(file)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M9.5 3L3 9.5M3 3l6.5 6.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息,Enter 发送,Shift + Enter 换行"
        rows={1}
        style={{
          minHeight: '24px',
          maxHeight: '144px',
          resize: 'none',
        }}
      />

      <div className="button-group">
        <label className="upload-btn">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e, 'file')}
            style={{ display: 'none' }}
          />
          <button className="action-btn">
            <img src={attachIcon} alt="link" />
          </button>
        </label>

        <label className="upload-btn">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
            style={{ display: 'none' }}
          />
          <button className="action-btn">
            <img src={imageIcon} alt="picture" />
          </button>
        </label>

        <div className="divider"></div>

        <button className="action-btn send-btn" disabled={loading} onClick={handleSend}>
          <img src={sendIcon} alt="send" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
