import { useState } from "react";
import ClientForm from "../../components/Form/ClientForm";
import { useCreateClientMutation, useUpdateClientMutation } from "../../services/api/clientApiSlice";
import { convertToSnakeCase } from "../../utils/generalUtils";
import { useParams } from "react-router-dom";
import useClientData from "../../hooks/useClientData"; // Custom hook
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const BusinessDetails = () => {
    const { clientId } = useParams();
    const [createClient] = useCreateClientMutation();
    const [updateClient] = useUpdateClientMutation();

    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Get client data, loading, and error state from custom hook
    const { client: clientData, isLoading, isError, error } = useClientData();

    const handleSubmit = async (values) => {
        // console.log("Submitting Values:", values);
        const snakeCaseValues = convertToSnakeCase(values);
        // console.log("Converted to Snake Case:", snakeCaseValues);

        const services = values.services || [];
        snakeCaseValues.client_type =
            services.includes('socialMedia') && services.includes('webDevelopment')
                ? 'both'
                : services.includes('socialMedia')
                    ? 'social_media'
                    : 'web_development';

        const socialHandles = {};
        (values.socialHandles || []).forEach((handle) => {
            if (handle.platform && handle.handle) {
                socialHandles[handle.platform.toLowerCase()] = handle.handle;
            }
        });
        snakeCaseValues.social_handles = socialHandles;

        try {
            if (!clientData || !clientData.id) {
                await createClient(snakeCaseValues).unwrap();
                setSuccessMessage("Client created successfully!");
                setErrorMessage(null);
            } else {
                await updateClient({ id: clientData.id, ...snakeCaseValues }).unwrap();
                setSuccessMessage("Client updated successfully!");
                setErrorMessage(null);
            }
        } catch (err) {
            console.error("Failed to submit client:", err);
            setErrorMessage("Failed to submit client. Please try again.");
            setSuccessMessage(null);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        return (
            <div className="error-container">
                Error: {error?.message || "Something went wrong while fetching client data."}
            </div>
        );
    }

    const initialValues = {
        businessName: clientData?.business_name || '',
        businessDetails: clientData?.business_details || '',
        businessAddress: clientData?.business_address || '',
        businessWhatsappNumber: clientData?.business_whatsapp_number || '',
        businessEmailAddress: clientData?.business_email_address || '',
        targetRegion: clientData?.target_region || '',
        businessOfferings: clientData?.business_offerings || '',
        numOfProducts: clientData?.num_of_products || '',
        businessWebsite: clientData?.business_website || '',
        websiteStructure: clientData?.website_structure || '',
        designPreference: clientData?.design_preference || '',
        domain: clientData?.domain || '',
        domain_info: clientData?.domain_info || '',
        hosting: clientData?.hosting || '',
        hosting_info: clientData?.hosting_info || '',
        websiteManagement: clientData?.website_management || '',
        IsSelfUpdate: clientData?.self_update || '',
        contactPerson: clientData?.contact_person || '',
        brandKeyPoints: clientData?.brand_key_points || '',
        brandGuidelinesLink: clientData?.brand_guidelines_link || '',
        ugcDriveLink: clientData?.ugc_drive_link || '',
        goalsObjectives: clientData?.goals_objectives || '',
        membership: clientData?.membership || '',
        additionalNotes: clientData?.additional_notes || '',
        services: clientData?.client_type
            ? clientData?.client_type === 'both'
                ? ['socialMedia', 'webDevelopment']
                : clientData.client_type === 'social_media'
                    ? ['socialMedia']
                    : ['webDevelopment']
            : [],
        socialHandles: Object.entries(clientData?.social_handles || {}).map(
            ([platform, handle]) => ({ platform, handle })
        ),
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

export default BusinessDetails;
