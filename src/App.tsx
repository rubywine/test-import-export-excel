import React, { useState } from 'react';
import { Upload, Download, Edit } from 'lucide-react';
import axios from 'axios';

interface ExcelData {
  [key: string]: string | number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [data, setData] = useState<ExcelData[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setData(response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API_URL}/export`, data, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exported_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  };

  const handleCellEdit = (row: number, col: string, value: string) => {
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
    setEditingCell(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Excel Import/Export Tool</h1>
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
            <Upload className="mr-2" size={20} />
            Import Excel
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls" />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Download className="mr-2" size={20} />
            Export Excel
          </button>
        </div>
        {data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((header) => (
                    <th key={header} className="px-4 py-2 bg-gray-100 border-b">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([col, value]) => (
                      <td key={col} className="px-4 py-2 border-b">
                        {editingCell?.row === rowIndex && editingCell?.col === col ? (
                          <input
                            type="text"
                            value={value as string}
                            onChange={(e) => handleCellEdit(rowIndex, col, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            autoFocus
                            className="w-full p-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ row: rowIndex, col })}
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded flex items-center"
                          >
                            {value as string}
                            <Edit className="ml-2" size={16} />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;