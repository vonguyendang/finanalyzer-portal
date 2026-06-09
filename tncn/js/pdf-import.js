// --- PDF IMPORT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const btnImport = document.getElementById('btn-import-pdf');
  const inputPdf = document.getElementById('import-pdf-input');
  const statusEl = document.getElementById('import-pdf-status');
  const fileListEl = document.getElementById('imported-files-list');

  // Cấu hình worker
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  if (btnImport && inputPdf) {
    btnImport.addEventListener('click', () => {
      inputPdf.click();
    });

    inputPdf.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      statusEl.textContent = `Đang xử lý ${files.length} file...`;
      statusEl.style.color = 'var(--blue)';

      if (!window.importedPdfNames) window.importedPdfNames = new Set();

      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        const fileSignature = `${file.name}_${file.size}_${file.lastModified}`;

        if (window.importedPdfNames.has(fileSignature)) {
          duplicateCount++;
          if (fileListEl) {
            const fileItem = document.createElement('div');
            fileItem.style.fontSize = '13px';
            fileItem.style.color = 'var(--text2)';
            fileItem.innerHTML = `📄 ${file.name} <span style="color: var(--gold);">⚠️ Bỏ qua (File đã import)</span>`;
            fileListEl.appendChild(fileItem);
          }
          continue;
        }
        try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          const grossMatch = fullText.match(/(?:\[17\]|\[16\]|\[14\]).*?Tổng thu nhập chịu thuế[^:]*:\s*([\d.,]+)/i) || 
                             fullText.match(/Tổng thu nhập chịu thuế[^:]*:\s*([\d.,]+)/i);
          const insMatch = fullText.match(/(?:\[14\]|\[14a\]).*?Khoản đóng bảo hiểm[^:]*:\s*([\d.,]+)/i) || 
                           fullText.match(/Khoản đóng bảo hiểm[^:]*:\s*([\d.,]+)/i);
          const taxMatch = fullText.match(/(?:\[19\]|\[18\]|\[16\]).*?thuế thu nhập cá nhân đã khấu trừ[^:]*:\s*([\d.,]+)/i) || 
                           fullText.match(/thuế thu nhập cá nhân đã khấu trừ[^:]*:\s*([\d.,]+)/i);
          const companyMatch = fullText.match(/(?:\[01\]|\[04\]).*?Tên tổ chức[^:]*:\s*(.*?)(?=\s*\[02\]|\s*Mã số thuế)/i) ||
                               fullText.match(/Tên tổ chức[^:]*:\s*(.*?)(?=\s*\[|\s*Mã số thuế|$)/i);
          let companyName = companyMatch ? companyMatch[1].trim() : '';

          let extractedGross = 0;
          let extractedIns = 0;
          let extractedTax = 0;

          // Loại bỏ tất cả dấu chấm, dấu phẩy và khoảng trắng trước khi parse
          if (grossMatch) extractedGross = parseInt(grossMatch[1].replace(/[.,\s]/g, ''), 10) || 0;
          if (insMatch) extractedIns = parseInt(insMatch[1].replace(/[.,\s]/g, ''), 10) || 0;
          if (taxMatch) extractedTax = parseInt(taxMatch[1].replace(/[.,\s]/g, ''), 10) || 0;

          if (extractedGross > 0 || extractedTax > 0) {
            const blocks = document.querySelectorAll('#refund-sources-container .source-block');
            
            // Check for duplicate data
            let isDataDuplicate = false;
            for (let block of blocks) {
              let existingGross = parseCurrency(block.querySelector('.refund-gross-input').value);
              let existingIns = parseCurrency(block.querySelector('.refund-ins-input').value);
              let existingTax = parseCurrency(block.querySelector('.refund-deducted-input').value);
              
              if (existingGross === extractedGross && existingIns === extractedIns && existingTax === extractedTax) {
                if (existingGross > 0 || existingTax > 0) {
                  isDataDuplicate = true;
                  break;
                }
              }
            }

            if (isDataDuplicate) {
              duplicateCount++;
              if (fileListEl) {
                const fileItem = document.createElement('div');
                fileItem.style.fontSize = '13px';
                fileItem.style.color = 'var(--text2)';
                fileItem.innerHTML = `📄 ${file.name} <span style="color: var(--gold);">⚠️ Bỏ qua (Dữ liệu đã tồn tại)</span>`;
                fileListEl.appendChild(fileItem);
              }
              window.importedPdfNames.add(fileSignature);
              continue;
            }

            let targetBlock = blocks[blocks.length - 1];
            
            let currentGross = parseCurrency(targetBlock.querySelector('.refund-gross-input').value);
            let currentIns = parseCurrency(targetBlock.querySelector('.refund-ins-input').value);
            let currentTax = parseCurrency(targetBlock.querySelector('.refund-deducted-input').value);
            
            if (currentGross > 0 || currentIns > 0 || currentTax > 0) {
              const btnAddRefundSource = document.getElementById('btn-add-refund-source');
              if (btnAddRefundSource) btnAddRefundSource.click();
              const newBlocks = document.querySelectorAll('#refund-sources-container .source-block');
              targetBlock = newBlocks[newBlocks.length - 1];
            }

            targetBlock.querySelector('.refund-gross-input').value = formatCurrency(extractedGross);
            targetBlock.querySelector('.refund-ins-input').value = formatCurrency(extractedIns);
            targetBlock.querySelector('.refund-deducted-input').value = formatCurrency(extractedTax);

            if (companyName) {
              const titleDiv = targetBlock.querySelector('.block-title-small');
              if (titleDiv) {
                if (titleDiv.childNodes.length > 0 && titleDiv.childNodes[0].nodeType === Node.TEXT_NODE) {
                  titleDiv.childNodes[0].textContent = companyName + ' ';
                } else {
                  titleDiv.insertBefore(document.createTextNode(companyName + ' '), titleDiv.firstChild);
                }
              }
            }

            targetBlock.dataset.fileSignature = fileSignature;

            if (fileListEl) {
              const fileItem = document.createElement('div');
              fileItem.style.display = 'flex';
              fileItem.style.justifyContent = 'space-between';
              fileItem.style.alignItems = 'center';
              fileItem.style.fontSize = '13px';
              fileItem.style.color = 'var(--text2)';
              fileItem.style.padding = '6px 10px';
              fileItem.style.background = 'var(--bg2)';
              fileItem.style.border = '1px solid var(--border2)';
              fileItem.style.borderRadius = '6px';
              fileItem.style.marginBottom = '6px';
              
              fileItem.innerHTML = `
                <span>📄 ${file.name} <span style="color: var(--green);">✓</span></span>
                <button type="button" class="remove-file-btn" style="background: none; border: none; color: #ff4757; cursor: pointer; padding: 2px; display: flex; align-items: center; justify-content: center;" title="Xóa file này">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              `;

              const removeBtn = fileItem.querySelector('.remove-file-btn');
              removeBtn.addEventListener('click', () => {
                const blocks = document.querySelectorAll('#refund-sources-container .source-block');
                blocks.forEach(block => {
                  if (block.dataset.fileSignature === fileSignature) {
                    block.remove();
                  }
                });
                if (typeof window.reindexRefundSources === 'function') window.reindexRefundSources();
                window.importedPdfNames.delete(fileSignature);
                fileItem.remove();
                if (typeof triggerCalculations === 'function') triggerCalculations();
              });

              fileListEl.appendChild(fileItem);
            }
            window.importedPdfNames.add(fileSignature);
            successCount++;
          } else {
            errorCount++;
            if (fileListEl) {
              const fileItem = document.createElement('div');
              fileItem.style.fontSize = '13px';
              fileItem.style.color = 'var(--text2)';
              fileItem.innerHTML = `📄 ${file.name} <span style="color: var(--gold);">⚠️ Trống</span>`;
              fileListEl.appendChild(fileItem);
            }
          }
        } catch (error) {
          console.error('Error parsing PDF:', error);
          errorCount++;
          if (fileListEl) {
            const fileItem = document.createElement('div');
            fileItem.style.fontSize = '13px';
            fileItem.style.color = 'var(--text2)';
            fileItem.innerHTML = `📄 ${file.name} <span style="color: #ff4757;">❌ Lỗi</span>`;
            fileListEl.appendChild(fileItem);
          }
        }
      }

      if (typeof triggerCalculations === 'function') triggerCalculations();

      if (errorCount === 0 && duplicateCount === 0) {
        statusEl.textContent = `✅ Đã import thành công ${successCount} file!`;
        statusEl.style.color = 'var(--green)';
      } else {
        let text = `⚠️ Hoàn tất: ${successCount} thành công`;
        if (errorCount > 0) text += `, ${errorCount} lỗi`;
        if (duplicateCount > 0) text += `, ${duplicateCount} trùng lặp`;
        statusEl.textContent = text + '.';
        statusEl.style.color = 'var(--gold)';
      }

      inputPdf.value = '';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 5000);
    });
  }
});
