import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfThumbnail = ({ src, title, className = '', pageClassName = '' }) => {
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      setPageWidth(Math.max(node.clientWidth, 1));
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div ref={containerRef} className={`h-full w-full overflow-hidden ${className}`}>
      {pageWidth > 0 && (
        <Document
          file={src}
          loading={<div className="h-full w-full bg-gray-100 dark:bg-gray-800" />}
          error={
            <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4 text-center text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {title || 'Preview unavailable'}
            </div>
          }
          className="h-full w-full"
        >
          <div className={`flex h-full w-full items-start justify-center overflow-hidden ${pageClassName}`}>
            <Page
              pageNumber={1}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        </Document>
      )}
    </div>
  );
};

export default PdfThumbnail;
