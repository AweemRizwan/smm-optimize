
// CreativeField.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const CreativeField = ({ row, role, onChange }) => {
  const isCarousel = row.type === 'Carousel';
  const isVideoOnly = row.type.toLowerCase().includes('video') || row.type.toLowerCase().includes('reel');

  // Helper to spot videos by URL extension
  const isVideoSrc = (url) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  const [previews, setPreviews] = useState(() => {
    if (isCarousel) {
      if (Array.isArray(row.creatives)) return row.creatives;
      if (row.creatives) return [row.creatives];
      return [];
    }
    return row.creatives || '';
  });
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const videoRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  // Modified upload function to use row ID as subfolder
  const uploadToSupabase = async (file, key = null) => {
    const baseFolder = 'creatives';
    const rowFolder = row.id; // Using row ID as subfolder

    // Create folder structure: creatives/{rowId}/{fileName}
    const filePath = `${baseFolder}/${rowFolder}/${file.name}`;

    const { error: uploadError } = await supabase
      .storage
      .from('smm-crm')
      .upload(filePath, file, {
        upsert: true,
        // You might want to add cache control headers here
        cacheControl: '3600'
      });

    if (uploadError) {
      // If folder doesn't exist, create it first then retry
      if (uploadError.message.includes('not found')) {
        // Create the folder by uploading an empty file
        const { error: folderError } = await supabase
          .storage
          .from('smm-crm')
          .upload(`${baseFolder}/${rowFolder}/.keep`, new Blob(), {
            upsert: true
          });

        if (folderError) throw folderError;

        // Retry the original upload
        const { error: retryError } = await supabase
          .storage
          .from('smm-crm')
          .upload(filePath, file, { upsert: true });

        if (retryError) throw retryError;
      } else {
        throw uploadError;
      }
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('smm-crm')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  // Cleanup blobs
  useEffect(() => {
    return () => {
      if (isCarousel && Array.isArray(previews)) {
        previews.forEach(u => u.startsWith('blob:') && URL.revokeObjectURL(u));
      } else if (typeof previews === 'string' && previews.startsWith('blob:')) {
        URL.revokeObjectURL(previews);
      }
    };
  }, [previews, isCarousel]);

  // Reload video on preview change
  useEffect(() => {
    if (isVideoOnly && videoRef.current && previews) {
      videoRef.current.load();
    }
  }, [previews, isVideoOnly]);

  // Initial upload & add more
  const handleFileChange = async e => {
    setError(null);
    const chosen = Array.from(e.target.files);
    if (!chosen.length) return;

    try {
      if (isCarousel) {
        const urls = await Promise.all(chosen.map(f => {
          if (f.size > MAX_VIDEO_SIZE && /\.(mp4|webm|ogg|mov)$/i.test(f.name)) {
            throw new Error(`"${f.name}" too large; max ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
          }
          return uploadToSupabase(f);
        }));
        const newPreviews = [...previews, ...urls];
        setPreviews(newPreviews);
        onChange(newPreviews);
        setActiveIndex(newPreviews.length - urls.length);
      } else if (isVideoOnly) {
        const file = chosen[0];
        if (file.size > MAX_VIDEO_SIZE) throw new Error(`Video too large; max ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
        const url = await uploadToSupabase(file);
        setPreviews(url);
        onChange(url);
      } else {
        const url = await uploadToSupabase(chosen[0]);
        setPreviews(url);
        onChange(url);
      }
    } catch (uploadErr) {
      console.error(uploadErr);
      setError(uploadErr.message || 'Upload failed; please try again.');
    } finally {
      e.target.value = '';
    }
  };

  // Replace a single slide but overwrite existing on Supabase
  const handleReplace = async e => {
    if (replaceIndex === null) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Check if the file is a video and exceeds size limit
      if (file.size > MAX_VIDEO_SIZE && /\.(mp4|webm|ogg|mov)$/i.test(file.name)) {
        throw new Error(`"${file.name}" too large; max ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
      }

      // Get the old URL to extract the path
      const oldUrl = previews[replaceIndex];

      // Extract the path from the old URL (after 'object/public/')
      const oldPath = oldUrl.split('/object/public/')[1];

      // Delete the old file first
      const { error: deleteError } = await supabase
        .storage
        .from('smm-crm')
        .remove([oldPath]);

      if (deleteError) {
        console.error('Error deleting old file:', deleteError);
        // Continue with upload even if deletion fails
      }

      // Upload the new file to the same path
      const url = await uploadToSupabase(file, oldPath);

      // Update the previews array with the new URL at the same index
      const updated = [...previews];
      updated[replaceIndex] = url;

      setPreviews(updated);
      onChange(updated);
    } catch (err) {
      console.error('Replace error:', err);
      setError(err.message || 'Replace upload failed');
    } finally {
      setReplaceIndex(null);
      e.target.value = '';
    }
  };


  const triggerReplace = idx => {
    setReplaceIndex(idx);
    // Reset the input value to allow selecting the same file again
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
    replaceInputRef.current?.click();
  };

  const renderPreview = () => {
    // Mixed-media carousel
    if (isCarousel) {
      if (!previews.length) return <span>No creative uploaded</span>;
      return (
        <div className="carousel-wrapper">
          <Slider {...sliderSettings} className="post-carousel">
            {previews.map((src, idx) => (
              <div key={idx} className="carousel-slide">
                {isVideoSrc(src)
                  ? <video controls width={500} className="post-media"><source src={src} /></video>
                  : <img src={src} alt={`slide-${idx}`} className="post-media" />
                }
              </div>
            ))}
          </Slider>
        </div>
      );
    }

    // Single video
    if (isVideoOnly) {
      return previews
        ? <video controls width={500} className="post-media" ref={videoRef}><source src={previews} /></video>
        : <span>No creative uploaded</span>;
    }

    // Single image
    return previews
      ? <img src={previews} alt="preview" />
      : <span>No creative uploaded</span>;
  };


  if (role !== 'graphics_designer') {
    return <div className="creative-field">{renderPreview()}</div>;
  }


  return (
    <div className="creative-field">
      <input type="file" ref={fileInputRef} accept={isCarousel ? 'image/*,video/*' : isVideoOnly ? 'video/*' : 'image/*'} multiple={isCarousel} onChange={handleFileChange} style={{ display: 'none' }} />
      {isCarousel && <input type="file" ref={replaceInputRef} accept="image/*,video/*" style={{ display: 'none' }} onChange={handleReplace} />}
      <div className="preview-container">{renderPreview()}</div>
      {error && <div className="error">{error}</div>}
      <button onClick={() => fileInputRef.current.click()} className="button-primary">
        {isCarousel
          ? previews.length ? 'Add More' : 'Upload Creatives'
          : previews
            ? isVideoOnly ? 'Change Video' : 'Change Creative'
            : isVideoOnly ? 'Upload Video' : 'Upload Creative'}
      </button>
      {role === 'graphics_designer' && isCarousel && (
        <button onClick={() => triggerReplace(activeIndex)} className="button-secondary ml-2">Replace Slide</button>
      )}
    </div>
  );
};

export default CreativeField;
