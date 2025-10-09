"use client"
import BoundingBoxDrawer from '@/components/boundingBoxDrawer';

const boxes =[
    {"x": 21, "y": 319, "width": 212, "height": 293, "label": "book"},
    {"x": 187, "y": 195, "width": 200, "height": 277, "label": "smartphone"},
    {"x": 356, "y": 306, "width": 577, "height": 409, "label": "spiral notebook"},
    {"x": 416, "y": 763, "width": 209, "height": 209, "label": "pen"},
    {"x": 25, "y": 19, "width": 377, "height": 249, "label": "green plant"},
    {"x": 360, "y": 0, "width": 246, "height": 187, "label": "wicker coaster"},
    {"x": 897, "y": 406, "width": 50, "height": 350, "label": "orange pencil"},
    {"x": 356, "y": 696, "width": 346, "height": 304, "label": "pen case"},
    {"x": 0, "y": 493, "width": 262, "height": 328, "label": "white headphones"}
  ]

export default function ImageWithBoundingBoxes() {
    const imageUrl = '/tableWithThings.jpg'; 
  
    return (
      <main className="flex flex-col items-center justify-center bg-black p-4 min-h-screen">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Bounding Boxes on Image</h1>
          <BoundingBoxDrawer imageUrl={imageUrl} boxes={boxes} />
        </div>
      </main>
    );
  }