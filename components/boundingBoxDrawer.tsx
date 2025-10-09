import React, { useRef, useEffect } from 'react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  confidence?: number;
}

interface BoundingBoxDrawerProps {
  imageUrl: string;
  boxes: BoundingBox[];
}

const BoundingBoxDrawer = ({ imageUrl, boxes }: BoundingBoxDrawerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx) {
        // Resize the image to fit within 640x640 while maintaining aspect ratio
        const maxDimension = 640;
        let { width, height } = image;
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        // Define a list of colors
        const colors = [
            'red', 'green', 'blue', 'yellow', 'orange', 'pink', 'purple', 'brown', 'gray', 'beige',
            'turquoise', 'cyan', 'magenta', 'lime', 'navy', 'maroon', 'teal', 'olive', 'coral', 'lavender',
            'violet', 'gold', 'silver'
          ];

        // Scale the bounding boxes to match the resized image
        const xScale = width / image.width;
        const yScale = height / image.height;

        boxes.forEach((box, i) => {
          // Use the x, y, width, height format
          const x1 = box.x;
          const y1 = box.y;
          const width = box.width;
          const height = box.height;

          const color = colors[i % colors.length];

          ctx.beginPath();
          ctx.rect(x1, y1, width, height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;
          ctx.stroke();
          ctx.font = '12px Arial';
          ctx.fillStyle = color;
          ctx.fillText(box.label || '', x1 + 8, y1 + 6);
        });
      }
    };
  }, [imageUrl, boxes]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />;
};

export default BoundingBoxDrawer;