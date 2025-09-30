import Skeleton from 'react-loading-skeleton'
import PropTypes from 'prop-types'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonLoader = ({ count, height, width, style }) => {
    return (
        <div className="skeleton-loader" data-testid="skeleton-loader" style={{ ...style }}>
            <Skeleton count={count} height={height} width={width} />
        </div>
    );
};

SkeletonLoader.propTypes = {
    count: PropTypes.number,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), 
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), 
    style: PropTypes.object, 
};
export default SkeletonLoader;
