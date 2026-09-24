import React from 'react';

export default function UploadModal({
  showUploadModal,
  setShowUploadModal,
  handleUploadInModal,
  uploading,
  uploadMessage,
  mappingInput,
  setMappingInput
}) {
  if (!showUploadModal) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
      <div className="bg-surface-container rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-surface-container-high animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">cloud_upload</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Upload New Dataset</h3>
          </div>
          <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleUploadInModal} className="p-6 flex flex-col gap-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Upload your CSV transactions dataset. Required headers: <code className="text-primary font-code-md">InvoiceNo, InvoiceDate, CustomerID, Category, Quantity, UnitPrice</code>
          </p>
          <div className="border-2 border-dashed border-surface-container-high hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-surface-container-low">
            <input type="file" name="file" accept=".csv" required className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:brightness-110 cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Column Mapping (Optional JSON):</label>
            <textarea
              value={mappingInput}
              onChange={(e) => setMappingInput(e.target.value)}
              placeholder='e.g. {"InvoiceNo": "No_Transaksi", "TotalPrice": "Total"}'
              className="w-full h-16 p-2 rounded-lg bg-surface-container-low border border-surface-container-high font-code-md text-xs text-on-surface outline-none focus:border-primary"
            />
          </div>
          {uploadMessage && (
            <div className={`p-3 rounded-lg text-xs font-medium ${uploadMessage.includes('failed') ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}`}>
              {uploadMessage}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-lg hover:bg-surface-container text-on-surface font-label-md">Cancel</button>
            <button type="submit" disabled={uploading} className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 transition-all disabled:opacity-50">
              {uploading ? 'Processing...' : 'Upload & Sync'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
