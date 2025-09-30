import { useParams, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../services/api/authApiSlice';
import UserForm from '../../components/Form/UserForm';

const Register = () => {
  const { agencySlug } = useParams();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();


  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agency_slug: agencySlug,
  };

  // Handle form submission.
  const handleSubmit = async (formData) => {
    try {
      await register(formData).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="container registration">
      <div className="userflow-container">
        <div className="userflow-bx">
          <h2>Register</h2>
          {error && <p className="error">Registration failed. Please try again.</p>}
          <UserForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel={isLoading ? 'Registering...' : 'Register'}
            isOwnProfile={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
