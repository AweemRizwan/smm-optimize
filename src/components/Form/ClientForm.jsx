import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import FieldAndError from './FieldAndError';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import useCurrentUser from '../../hooks/useCurrentUser';
import platforms from '../../constants/platforms';
import Select from 'react-select';
import { removeEmptyFields } from '../../utils/generalUtils';
import addicon from '../../assets/images/plus-icon.png'
import minus from '../../assets/images/minusicon.png'

const formatPlatformOptions = platforms.map((platform) => ({
    value: platform.name.toLowerCase(),
    label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={platform.icon} alt={platform.name} width="20" height="20" />
            {/* {platform.name} */}
        </div>
    ),
}));

const socialMediaIcons = {
    facebook: <FaFacebookF />,
    instagram: <FaInstagram />,
    twitter: <FaTwitter />,
    linkedin: <FaLinkedin />,
    youtube: <FaYoutube />,
};

const ClientForm = ({ initialValues, onSubmit }) => {
    const { role } = useCurrentUser(); // Get the user role

    const validationSchema = Yup.object({
        businessName: Yup.string().required('Business name is required'),
        businessDetails: Yup.string().required('Business details are required'),
        businessAddress: Yup.string().required('Business address is required'),
        businessWhatsappNumber: Yup.string()
            .matches(/^[0-9+() -]+$/, 'Invalid phone number format')
            .required('Business WhatsApp number is required'),
        businessEmailAddress: Yup.string()
            .email('Invalid email format')
            .required('Business Email address is required'),

        // Social Media specific
        targetRegion: Yup.string()
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('socialMedia'),
                then: (schema) => schema.required('Target region is required'),
                otherwise: (schema) => schema.strip()
            }),

        ugcDriveLink: Yup.string()
            .url('Invalid URL')
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('socialMedia'),
                then: (schema) => schema.required('UGC drive link is required'),
                otherwise: (schema) => schema.strip()
            }),

        socialHandles: Yup.array()
            .of(Yup.object().shape({
                platform: Yup.string().required('Platform is required'),
                handle: Yup.string().required('Handle is required'),
            }))
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('socialMedia'),
                then: (schema) => schema.min(1, 'At least one social handle is required'),
                otherwise: (schema) => schema.strip(),
            }),

        // General business info
        businessOfferings: Yup.string().required('Business offerings is required'),

        numOfProducts: Yup.number()
            .nullable()
            .positive('Number of products must be positive')
            .integer('Number of products must be an integer')
            .when('businessOfferings', {
                is: (value) => value === 'products' || value === 'services_products',
                then: (schema) => schema.required('Number of products is required'),
            }),

        businessWebsite: Yup.string().url('Invalid URL').required('Business website is required'),

        // Web Development specific
        websiteStructure: Yup.string()
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('webDevelopment'),
                then: (schema) => schema.required('Website structure is required'),
                otherwise: (schema) => schema.strip()
            }),

        designPreference: Yup.string()
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('webDevelopment'),
                then: (schema) => schema.required('Design preferences are required'),
                otherwise: (schema) => schema.strip()
            }),

        domain: Yup.string()
            .nullable()
            .transform((value) => (value === "" ? undefined : value))
            .when("services", {
                is: (services) => Array.isArray(services) && services.includes("webDevelopment"),
                then: (schema) => schema.required("Domain selection is required"),
                otherwise: (schema) => schema.strip(),
            }),

        domain_info: Yup.string()
            .nullable()
            .when(['services', 'domain'], {
                is: ([services, domain]) =>
                    Array.isArray(services) && services.includes('webDevelopment') && domain === 'yes',
                then: (schema) => schema.required('Domain information is required'),
                otherwise: (schema) => schema.strip()
            }),

        hosting: Yup.string()
            .nullable()
            .transform((value) => (value === "" ? undefined : value))
            .when("services", {
                is: (services) => Array.isArray(services) && services.includes("webDevelopment"),
                then: (schema) => schema.required("Hosting selection is required"),
                otherwise: (schema) => schema.strip(),
            }),

        hosting_info: Yup.string()
            .nullable()
            .when(['services', 'hosting'], {
                is: ([services, hosting]) =>
                    Array.isArray(services) && services.includes('webDevelopment') && hosting === 'yes',
                then: (schema) => schema.required('Hosting information is required'),
                otherwise: (schema) => schema.strip()
            }),

        websiteManagement: Yup.string()
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('webDevelopment'),
                then: (schema) => schema.required('Website management selection is required'),
                otherwise: (schema) => schema.strip()
            }),

        isSelfUpdate: Yup.string()
            .nullable()
            .when('services', {
                is: (services) => Array.isArray(services) && services.includes('webDevelopment'),
                then: (schema) => schema.required('Self-update selection is required'),
                otherwise: (schema) => schema.strip()
            }),

        membership: Yup.string()
            .nullable()
            .transform((value) => (value === "" ? undefined : value))
            .when("services", {
                is: (services) => Array.isArray(services) && services.includes("webDevelopment"),
                then: (schema) => schema.required("Membership selection is required"),
                otherwise: (schema) => schema.strip(),
            }),

        contactPerson: Yup.string().required('Contact person is required'),
        brandKeyPoints: Yup.string().nullable(),
        brandGuidelinesLink: Yup.string().url('Invalid URL').required('Brand guidelines link is required'),
        goalsObjectives: Yup.string().required('Goals and Objectives are required'),
        additionalNotes: Yup.string().nullable(),
        services: Yup.array().min(1, 'Please select at least one service')
    });


    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            validateOnMount
            onSubmit={async (values, actions) => {
                const filtered = removeEmptyFields(values);
                try {
                    await onSubmit(filtered);
                } catch (err) {
                    console.error(err);
                } finally {
                    actions.setSubmitting(false);
                }
            }}

        >
            {({ values, errors, isValid, isSubmitting }) => (
                <Form>
                    {/* {console.log('Form values:', values)} */}
                    {/* {console.log('Form errors:', errors)} */}
                    <div className="row wrap gap-20 m-0">

                        <div className="col-md-12">
                            {/* Service Information */}
                            <div className="form-group">
                                <h2 htmlFor="services">Service Information</h2>
                                <div className="d-flex gap-20">
                                    <div className="form-check">
                                        <Field type="checkbox" name="services" value="socialMedia" id="socialMedia" className="form-check-input" />
                                        <label className="form-check-label" htmlFor="socialMedia">Social Media Services</label>
                                    </div>
                                    <div className="form-check">
                                        <Field type="checkbox" name="services" value="webDevelopment" id="webDevelopment" className="form-check-input" />
                                        <label className="form-check-label" htmlFor="webDevelopment">Web Development Services</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-6 col-md-12">
                            {/* Client Business Information */}
                            <FieldAndError id="businessName" name="businessName" label="Business Name" placeholder="Good Guys Wash Shack" customClass="border-input" />
                            <FieldAndError id="businessDetails" name="businessDetails" label="Business Details/Industry" type="textarea" rows={6} placeholder="Car Wash Service" customClass="border-input" />
                            <FieldAndError id="businessAddress" name="businessAddress" label="Business Address" placeholder="34 Huldah Ave. George Town, Grand Cayman" customClass="border-input" />
                            <FieldAndError id="businessWhatsappNumber" name="businessWhatsappNumber" label="Business WhatsApp Number" placeholder="(345) 938-0666" customClass="border-input" />
                            <FieldAndError id="businessEmailAddress" name="businessEmailAddress" label="Business Email Address" placeholder="info@goodguyswashshack.com" customClass="border-input" />
                            {values.services?.includes('socialMedia') && (
                                <FieldAndError name="targetRegion" label="Target Region" placeholder="Cayman Islands" customClass="border-input" />
                            )}
                            <div className="form-group">
                                <label htmlFor="businessOfferings">Business Offerings</label>
                                <div className="d-flex gap-20">
                                    <div className="form-check">
                                        <Field type="radio" name="businessOfferings" id="services" value="services" className="form-check-input" />
                                        <label className="form-check-label" htmlFor="services">Services</label>
                                    </div>
                                    <div className="form-check">
                                        <Field type="radio" name="businessOfferings" id="products" value="products" className="form-check-input" />
                                        <label className="form-check-label" htmlFor="products">Products</label>
                                    </div>
                                    <div className="form-check">
                                        <Field type="radio" name="businessOfferings" id="servicesProducts" value="services_products" className="form-check-input" />
                                        <label className="form-check-label" htmlFor="servicesProducts">Services + Products</label>
                                    </div>
                                </div>
                            </div>
                            {(values.businessOfferings === 'products' || values.businessOfferings === 'services_products') && (
                                <FieldAndError
                                    name="numOfProducts"
                                    label="Number of Products"
                                    type="number"
                                    placeholder="Enter product count"
                                    customClass="border-input"
                                />
                            )}
                            <FieldAndError name="businessWebsite" label="Business Website" placeholder="https://goodguyswashshack.com" customClass="border-input" />

                            {values.services?.includes('webDevelopment') && (
                                <>
                                    <label>Website Structure</label>
                                    <p className="frm-txt">Please list all the sections/pages you think you’ll need. (For example: Home, About, Services, Contact, etc.)</p>
                                    <FieldAndError name="websiteStructure" placeholder="Type here" customClass="border-input mt-1" />
                                    <label>Design Preferences</label>
                                    <p className="frm-txt">Is there a specific look and feel that you have in mind? Please include at least 3 links to competitor sites or templates. Describe or provide examples of design inspiration and what you like and dislike about them? What would you like to do differently?</p>
                                    <FieldAndError name="designPreference" placeholder="Type here" customClass="border-input mt-1" />

                                    <h2>Domain and Hosting Information</h2>
                                    <FieldAndError
                                        name="domain"
                                        label="Do you already have a domain name?"
                                        renderField={() => (
                                            <div className="d-flex gap-20">
                                                <label className="d-flex chk-scochi">
                                                    <Field type="radio" name="domain" value="yes" /> Yes
                                                </label>
                                                <label className="d-flex chk-scochi">
                                                    <Field type="radio" name="domain" value="no" /> No
                                                </label>
                                            </div>
                                        )}
                                    />
                                    {values.domain === 'yes' && (
                                        <FieldAndError
                                            name="domain_info"
                                            label="Enter your domain name"
                                            type="text"
                                            placeholder="e.g., www.example.com"
                                            customClass="border-input"
                                        />
                                    )}
                                    <FieldAndError
                                        name="hosting"
                                        label="Do you need hosting?"
                                        renderField={() => (
                                            <div className="d-flex gap-20">
                                                <label className="d-flex chk-scochi">
                                                    <Field type="radio" name="hosting" value="yes" /> Yes
                                                </label>
                                                <label className="d-flex chk-scochi">
                                                    <Field type="radio" name="hosting" value="no" /> No
                                                </label>
                                            </div>
                                        )}
                                    />
                                    {values.hosting === 'yes' && (
                                        <FieldAndError
                                            name="hosting_info"
                                            label="Enter hosting details"
                                            type="text"
                                            placeholder="Enter your hosting provider details"
                                            customClass="border-input"
                                        />
                                    )}
                                    <h2>Website Management</h2>
                                    <FieldAndError name="websiteManagement" label="Do you need website management?" renderField={() => (
                                        <div className="d-flex gap-20">
                                            <label className="d-flex chk-scochi">
                                                <Field type="radio" name="websiteManagement" value="yes" /> Yes
                                            </label>
                                            <label className="d-flex chk-scochi">
                                                <Field type="radio" name="websiteManagement" value="no" /> No
                                            </label>
                                        </div>
                                    )} />
                                    <FieldAndError name="isSelfUpdate" label="Do you want to update the site yourself?" renderField={() => (
                                        <div className="d-flex gap-20">
                                            <label className="d-flex chk-scochi">
                                                <Field type="radio" name="isSelfUpdate" value="yes" /> Yes
                                            </label>
                                            <label className="d-flex chk-scochi">
                                                <Field type="radio" name="isSelfUpdate" value="no" /> No
                                            </label>
                                        </div>
                                    )} />
                                </>
                            )}
                        </div>

                        <div className="col-xl-6 col-md-12">
                            <FieldAndError name="contactPerson" label="Contact Person" placeholder="Lachlan Hewitt, Gregg Watkins, Peter Anderson" customClass="border-input" />
                            <FieldAndError name="brandKeyPoints" label="Brand Key Points" type="textarea" rows={6} placeholder="Key points here" customClass="border-input" />
                            <FieldAndError name="brandGuidelinesLink" label="Brand Guidelines Link" placeholder="https://drive.google.com" customClass="border-input" />

                            {values.services?.includes('socialMedia') && (
                                <FieldAndError name="ugcDriveLink" label="UGC Drive Link" placeholder="https://drive.google.com" customClass="border-input" />
                            )}
                            <FieldAndError
                                name="goalsObjectives"
                                label="Goals and Objectives"
                                type="textarea"
                                rows={4}
                                placeholder="Describe the goals and objectives."
                                customClass="border-input mt-1"
                            />

                            <FieldArray
                                name="socialHandles"
                                render={(arrayHelpers) => (
                                    <div>
                                        <label>Social Handles</label>
                                        {values?.socialHandles?.map((social, index) => (
                                            <div className="d-flex align-center mb-1 gap-10 social-handle-err" key={index}>
                                                <div className='d-flex align-center border-input border-radius-10 p-0 width-100'>
                                                    <Select
                                                        name={`socialHandles[${index}].platform`}
                                                        options={formatPlatformOptions}
                                                        value={formatPlatformOptions.find(option => option.value === social.platform) || null}
                                                        onChange={(selectedOption) =>
                                                            arrayHelpers.replace(index, { ...social, platform: selectedOption.value })
                                                        }
                                                        className="width-20"
                                                        styles={{
                                                            control: (provided, state) => ({
                                                                ...provided,
                                                                border: '0px',
                                                                padding: "0px",
                                                                background: 'none',
                                                                boxShadow: 'none',
                                                            }),
                                                            placeholder: (provided) => ({
                                                                ...provided,
                                                                color: "#1B1B1B80",
                                                                fontSize: "14px",
                                                                fontWeight: "400",
                                                                width: '30px',
                                                            }),
                                                        }}
                                                    />
                                                    <FieldAndError
                                                        name={`socialHandles[${index}].handle`}
                                                        placeholder="Enter social handle"
                                                        customClass="border-none flex-grow-1 social-info width-100 m-0 "
                                                        parentClass='m-0 width-100'
                                                    />
                                                </div>
                                                {role === 'account_manager' && (
                                                    <img className='object-cover cursor-pointer' onClick={() => arrayHelpers.remove(index)} src={minus} alt="" width={28} height={28} />
                                                )}
                                            </div>
                                        ))}
                                        {(role === 'account_manager' || role === 'user') && (
                                            <button
                                                type="button"
                                                onClick={() => arrayHelpers.push({ platform: '', handle: '' })}
                                                className="btn button-accent-2 mt-2 width-100 border-radius-10 border-none d-flex justify-center align-center"
                                            >
                                                <img src={addicon} alt="" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            />

                            {values.services?.includes('webDevelopment') && (
                                <>
                                    <FieldAndError
                                        name="membership"
                                        label="Do you offer any Membership?"
                                        parentClass=" mt-3"
                                        renderField={() => (
                                            <div className="d-flex gap-20">
                                                <label className="d-flex chk-scochi">
                                                    <Field type="radio" name="membership" value="yes" /> Yes
                                                </label>
                                                <label className="d-flex chk-scochi">
                                                    <Field type="radio" name="membership" value="no" /> No
                                                </label>
                                            </div>
                                        )}
                                    />
                                </>
                            )}
                        </div>
                        <div className="col-md-12">
                            <FieldAndError name="additionalNotes" label="Additional Notes" type="textarea" rows={4} placeholder="Enter notes here" customClass="border-input mt-1" />
                        </div>
                    </div>
                    {(role === 'account_manager' || role === 'user') && (
                        <div className="d-flex justify-center">
                            <button type="submit" className="btn button-secondary px-5" disabled={!isValid || isSubmitting}>{isSubmitting ? 'Updating…' : 'Update Information'}</button>
                        </div>
                    )}
                </Form>
            )}
        </Formik>
    );
};

ClientForm.propTypes = {
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default ClientForm;
