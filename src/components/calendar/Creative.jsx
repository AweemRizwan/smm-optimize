
const UploadButton = ({ onUpload, disabled }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onUpload(file); // Call the callback function with the file name
        }
    };

    return (
        <button className="upload-button-container button-accent-2-light">
            <input
                type="file"
                id="upload"
                name="upload"
                style={{ display: 'none' }}
                disabled={disabled}
                onChange={handleFileChange}
            />
            <label htmlFor="upload" className="upload-button cursor-pointer">
                Upload
            </label>
        </button>
    );
};

export default UploadButton;