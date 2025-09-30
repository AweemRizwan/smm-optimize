import { useState } from "react";
import { formatDate } from "../../utils/generalUtils"; // Adjust path if needed
import PropTypes from "prop-types";
import Slider from "react-slick";
import Media from "./Media";
import { useUpdateCalendarDateMutation } from "../../services/api/calendarApiSlice";
import { FiSend } from "react-icons/fi"; // ✅ Send icon
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ApprovalGroup from '../../components/buttons/ApprovalGroup';


const PostCard = ({ post, isEven, onClientApproval=null, role }) => {
  const isCarousel = Array.isArray(post.creatives) && post.creatives.length > 1;

  const allowedRoles = ["account_manager", "user"];
  const showClientApprovalButtons = allowedRoles.includes(role);
  const canEditComments = allowedRoles.includes(role);

  const [localComment, setLocalComment] = useState(post.comments || "");
  const [savingComment, setSavingComment] = useState(false);
  const [updateCalendarDate] = useUpdateCalendarDateMutation();

  const handleSendComment = async () => {
    if (localComment === post.comments || savingComment) return; // No change or already saving

    setSavingComment(true);
    try {
      await updateCalendarDate({
        calendarId: post.calendar,
        dateId: post.id,
        data: { comments: localComment },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <div className={`post-card ${isEven ? "even" : "odd"}`}>
      <div className="post-media-container col-xl-6 d-flex justify-center align-center">
        {isCarousel ? (
          <Slider {...{
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1
          }} className="post-carousel">
            {post.creatives.map((src, index) => (
              <Media key={index} src={src} alt={`${post.tagline || "No tagline"} ${index + 1}`} className="post-media" />
            ))}
          </Slider>
        ) : (
          <Media
            src={typeof post.creatives === "string" ? post.creatives : post.creatives[0]}
            alt={post.tagline || "No tagline"}
            className="post-media"
          />
        )}
      </div>

      <div className="post-content col-xl-6">
        <h2>{post.tagline || "No tagline available"}</h2>
        <p><strong>Date:</strong> {formatDate(post.date, true)}</p>
        <p><strong>Category:</strong> {post.category}</p>
        <p><strong>Type:</strong> {post.type}</p>
        <p><strong>CTA:</strong> {post.cta}</p>
        <p><strong>Caption:</strong> {post.caption}</p>
        <p><strong>Hashtags:</strong> {post.hashtags}</p>

        {showClientApprovalButtons && (
          <div className="approval-buttons mt-3 d-flex flex-direction-column">
            <ApprovalGroup
              row={post}
              handleApproval={onClientApproval}
              scopeKey="client_approval"
              role={role || ''}
              // role={role}
            />
          </div>
        )}

        <div className="mt-3 comment-section">
          <strong className="comment-label">Comments:</strong>
          {canEditComments ? (
            <div className="comment-input-container">
              <div className="comment-textarea-wrapper">
                <textarea
                  value={localComment}
                  onChange={(e) => setLocalComment(e.target.value)}
                  className="comment-textarea"
                  rows={1}
                  disabled={savingComment}
                  placeholder="Add your comment..."
                />
                <button
                  onClick={handleSendComment}
                  disabled={savingComment || localComment === post.comments || !localComment.trim()}
                  className="comment-send-button"
                  title="Send"
                >
                  <FiSend size={18} className="send-icon" />
                </button>
              </div>
            </div>
          ) : (
            <p className="comment-display">{post.comments || "—"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    calendar: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tagline: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    cta: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    hashtags: PropTypes.string.isRequired,
    creatives: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    creativesType: PropTypes.oneOf(["image", "video", "reel", "link"]).isRequired,
    client_approval: PropTypes.shape({
      content_approval: PropTypes.bool,
      creatives_approval: PropTypes.bool,
    }),
    comments: PropTypes.string,
  }).isRequired,
  isEven: PropTypes.bool.isRequired,
  onClientApproval: PropTypes.func,
  role: PropTypes.oneOf([
    "marketing_manager",
    "account_manager",
    "content_writer",
    "graphics_designer",
    "marketing_director",
    "user"
  ]).isRequired,
};

// PostCard.defaultProps = {
//   onClientApproval: null,
// };

export default PostCard;
