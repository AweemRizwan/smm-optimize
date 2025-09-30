import { useState } from "react";
import ClientForm from "../../components/Form/ClientForm";
import { useCreateClientMutation } from "../../services/api/clientApiSlice";
import { convertToSnakeCase } from '../../utils/generalUtils';
import {
  ErrorContainer,
  SuccessContainer,
  ToastContainer
} from '../../components/toast/Toast';

const NewClient = () => {
  const [createClient] = useCreateClientMutation();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Initial values for all form fields
  const initialValues = {
    businessName: '',
    businessDetails: '',
    businessAddress: '',
    businessWhatsappNumber: '',
    businessEmailAddress: '',
    targetRegion: '',
    businessOfferings: '',
    numOfProducts: '',
    businessWebsite: '',
    websiteStructure: '',
    designPreference: '',
    domain: '',
    domain_info: '',
    hosting: '',
    hosting_info: '',
    websiteManagement: '',
    selfUpdate: '',
    contactPerson: '',
    brandKeyPoints: '',
    brandGuidelinesLink: '',
    ugcDriveLink: '',
    goalsObjectives: '',
    membership: '',
    additionalNotes: '',
    services: [],
    socialHandles: [
      { platform: "", handle: "" }    // ← one blank handle to start with
    ],
  };

  const handleSubmit = async (values) => {
    // console.log('Submitting form with values:', values);

    const formattedValues = convertToSnakeCase(values);
    const services = values.services || [];
    formattedValues.client_type =
      services.includes('socialMedia') && services.includes('webDevelopment')
        ? 'both'
        : services.includes('socialMedia')
          ? 'social_media'
          : 'web_development';

    const socialHandles = {};
    values.socialHandles.forEach((handle) => {
      if (handle.platform && handle.handle) {
        socialHandles[handle.platform.toLowerCase()] = handle.handle;
      }
    });
    formattedValues.social_handles = socialHandles;

    try {
      await createClient(formattedValues).unwrap();
      setSuccessMessage('Client created successfully!');
      setErrorMessage(null);
    } catch (error) {
      const message = error?.data?.message || 'Failed to create client. Please try again.';
      setErrorMessage(message);
      setSuccessMessage(null);
    }
  };

  return (
    <div className="section">
      <ToastContainer>
        {successMessage && (
          <SuccessContainer
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        {errorMessage && (
          <ErrorContainer
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}
      </ToastContainer>
      <ClientForm initialValues={initialValues} onSubmit={handleSubmit} />
    </div>
  );
};

export default NewClient;
