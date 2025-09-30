import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import FieldAndError from './FieldAndError';
import userprofile from "../../assets/Images/ProfilePicture.png";
import { formatString } from '../../utils/generalUtils';
import SelectField from './SelectField';


const UserForm = ({ initialValues, onSubmit, submitLabel, isOwnProfile = false }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [copied, setCopied] = useState(false);

        // ✅ Normalize undefined -> ""
    const normalizedInitialValues = {
        first_name: initialValues.first_name ?? "",
        last_name: initialValues.last_name ?? "",
        email: initialValues.email ?? "",
        role: initialValues.role ?? "",
        agency_name: initialValues.agency_name ?? "",
        agency_slug: initialValues.agency_slug ?? "",
        profile: initialValues.profile ?? null,
        password: initialValues.password ?? "",
        confirmPassword: initialValues.confirmPassword ?? "",
    };

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required('Required'),
        last_name: Yup.string().required('Required'),
        email: Yup.string().email('Invalid email address').required('Required'),
        role: Yup.string().required('Role is required'),
        agency_name: Yup.string().when('role', {
            is: 'account_manager',
            then: (schema) => schema.required('Agency name is required for Account Manager'),
            otherwise: (schema) => schema.nullable(),
        }),
        agency_slug: Yup.string().when('role', {
            is: 'account_manager',
            then: (schema) => schema.required('Agency slug is required for Account Manager'),
            otherwise: (schema) => schema.nullable(),
        }),
        ...(isOwnProfile && {
            password: Yup.string().min(6, 'Password must be at least 6 characters long').nullable(),
            confirmPassword: Yup.string().when('password', {
                is: (value) => value && value.length > 0,
                then: (schema) =>
                    schema
                        .oneOf([Yup.ref('password')], 'Passwords must match')
                        .required('Confirm password is required when entering a new password'),
                otherwise: (schema) => schema.nullable(),
            }),
        })
    });
    const handleImageUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);

            setFieldValue('profile', file);
        }
    };

    const handleRoleChange = (values) => {
        setSelectedRole(values);
    };

    useEffect(() => {
        if (initialValues) {
            setSelectedRole(initialValues.role);
            setProfileImage(initialValues.profile);
        }
    }, [initialValues]);



    return (
        <Formik
            initialValues={normalizedInitialValues}
            enableReinitialize
            validationSchema={validationSchema}
            // validateOnBlur={true}
            // validateOnChange={true}
            validateOnMount
            onSubmit={async (values, { setTouched, setSubmitting }) => {
                setTouched({
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true,
                    agency_name: true,
                    password: true,
                    confirmPassword: true,
                })

                // eslint-disable-next-line no-unused-vars
                const { confirmPassword, ...valuesToSubmit } = values;

                const formData = new FormData();

                // Append text fields
                Object.keys(valuesToSubmit).forEach((key) => {
                    if (valuesToSubmit[key] && key !== "profile") {
                        formData.append(key, valuesToSubmit[key]);
                    }
                });

                // Append profile image only if it's a file
                if (valuesToSubmit.profile instanceof File) {
                    formData.append("profile", valuesToSubmit.profile);
                } else {
                    console.warn("Profile is not a file:", valuesToSubmit.profile);
                }

                try {
                    await onSubmit(formData);
                } catch (err) {
                    console.error(err);
                }
                // now tell Formik we're done
                setSubmitting(false);
            }}

        >
            {({ isSubmitting, isValid, values, setFieldValue }) => (
                <div className="user-page-content mt-3">
                    <div className='row gap-0 no-gutter'>
                        <div className='col-md-7'>
                            <div className="create-user-section">
                                <Form>
                                    <FieldAndError customClass="border-input" name="first_name" label="First Name" labelClass="label-base label-dark" placeholder='First Name' />
                                    <FieldAndError customClass="border-input" name="last_name" label="Last Name" labelClass="label-base label-dark" placeholder='Last Name' />
                                    <FieldAndError customClass="border-input" name="email" label="Email Address" type="email" labelClass="label-base label-dark" placeholder='Email Address' />
                                    {selectedRole === 'account_manager' && (
                                        <>
                                            <FieldAndError
                                                customClass="border-input"
                                                name="agency_name"
                                                label="Agency Name"
                                                type="text"
                                                labelClass="label-base label-dark"
                                            />
                                            <FieldAndError
                                                customClass="border-input"
                                                name="agency_slug"
                                                label="Agency Slug"
                                                type="text"
                                                labelClass="label-base label-dark"
                                            />
                                        </>
                                    )}

                                    {!isOwnProfile && (
                                        <>
                                            <SelectField
                                                label="Role"
                                                name="role"
                                                placeholder="Select Role"
                                                dropdownPosition="static"
                                                options={[
                                                    { value: 'content_writer', label: 'Content Writer' },
                                                    { value: 'graphics_designer', label: 'Graphics Designer' },
                                                    { value: 'marketing_manager', label: 'Marketing Manager' },
                                                    { value: 'account_manager', label: 'Account Manager' },
                                                    { value: 'marketing_assistant', label: 'Marketing Assistant' },
                                                    { value: 'accountant', label: 'Accountant' },
                                                ]}
                                                value={values.role}
                                                onChange={(value) => {
                                                    handleRoleChange(value);
                                                    setFieldValue('role', value);
                                                }}
                                            />
                                        </>

                                    )}

                                    {isOwnProfile && (
                                        <>
                                            <FieldAndError customClass="border-input" name="password" label="Change Password" type="password" labelClass="label-base label-dark" showPasswordToggle={true} placeholder='Enter new password' />
                                            <FieldAndError customClass="border-input" name="confirmPassword" type="password" labelClass="label-base label-dark" showPasswordToggle={true} placeholder='Re-enter new password' />
                                        </>
                                    )}

                                    <button type="submit" className='button-secondary mt-5' disabled={!isValid || isSubmitting}>
                                        {isSubmitting ? 'saving...' : submitLabel}
                                    </button>
                                </Form>
                            </div>
                        </div>
                        <div className='col-md-5'>
                            <div className="profile-display-section text-center mt-5">
                                <div className="user-profile d-flex flex-column align-items-center flex-direction">
                                    <div className="profile-image border-radius-50">
                                        <label htmlFor="fileInput">
                                            <img
                                                src={profileImage || userprofile}
                                                alt="User Profile"
                                            />
                                        </label>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            data-testid="file-upload"  // ✅ Add a test ID for selection
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, setFieldValue)}
                                        />
                                    </div>
                                    <div className="profile-info">
                                        <h2>{values.first_name || 'User Name'} {values.last_name}</h2>
                                        <p> {formatString(values.role) || 'Role'} </p>
                                        {/* ✅ Show Agency URL when role is account_manager and slug is available */}
                                        {selectedRole === 'account_manager' && values.agency_slug && (
                                            <div className="mt-1 agency-url-container d-flex align-center d-flex-space-between border-radius">
                                                <span className="agency-url-text">{`${window.location.origin}/${values.agency_slug}/register`}</span>
                                                <button
                                                    type="button"
                                                    className="copy-button bg-none border-none p-0 d-flex align-center"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/${values.agency_slug}/register`);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 1500); // Revert after 1.5 seconds
                                                    }}
                                                >
                                                    {copied ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="copy-icon" fill="#1b1b1b">
                                                            <path d="M504.5 75.5c9.4 9.4 9.4 24.6 0 33.9L215.9 398.1c-9.4 9.4-24.6 9.4-33.9 0L7.5 223.6c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L198.9 347 470.6 75.5c9.4-9.4 24.6-9.4 33.9 0z" />
                                                        </svg>
                                                    ) : (
                                                        // Clipboard icon
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="copy-icon">
                                                            <path d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </Formik>
    )
};

UserForm.propTypes = {
    initialValues: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
        agency_name: PropTypes.string,
        profile: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(File)]),
        password: PropTypes.string,
        confirmPassword: PropTypes.string,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitLabel: PropTypes.string.isRequired,
    isOwnProfile: PropTypes.bool, // Prop to indicate if it's the user's own profile
};

export default UserForm;
