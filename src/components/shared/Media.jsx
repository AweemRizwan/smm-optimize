import PropTypes from "prop-types";

const Media = ({ src, type, alt, className, ...props }) => {
    if (!src) return <p>Media not available</p>;

    const getMediaTypeFromLink = (link, overrideType = null) => {
        if (!link) return null;

        // If a specific type is provided, use it
        if (overrideType) return overrideType;

        // Default to checking the file extension (if embedded in the link)
        if (link.includes(".jpg") || link.includes(".jpeg") || link.includes(".png") || link.includes(".gif") || link.includes(".webp")) {
            return "image";
        }

        if (link.includes(".mp4") || link.includes(".mov") || link.includes(".avi")) {
            return "video";
        }

        // For generic Google Drive links, fallback to default (reel or unsupported)
        if (link.includes("drive.google.com/file/d/")) {
            return "reel"; // Assume it's a reel unless specified otherwise
        }

        return null;
    };


    const resolvedType = getMediaTypeFromLink(src, type);

    if (resolvedType === "image") {
        return <img src={src} alt={alt || "media"} className={className} {...props} />;
    }

    if (resolvedType === "video") {
        return (
            <video className={className} controls {...props}>
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        );
    }

    if (resolvedType === "reel") {
        return (
            <iframe
                src={`https://drive.google.com/file/d/${src.match(/\/d\/([^/]+)/)?.[1]}/preview`}
                title={alt || "reel"}
                className={className}
                allow="autoplay; encrypted-media"
                allowFullScreen
                {...props}
            />
        );
    }

    return <p>Unsupported media type</p>;
};


Media.propTypes = {
    src: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["image", "video", "reel"]),
    alt: PropTypes.string,
    className: PropTypes.string,
};

export default Media;