import { Formik, Form } from 'formik'
import PropTypes from 'prop-types'
import FieldAndError from './FieldAndError'
import { useGetUsersByRoleQuery } from '../../services/api/userApiSlice'
import SelectField from './SelectField';
import * as Yup from 'yup';




const TeamForm = ({ initialValues, onSubmit, heading, subHeading, buttontext }) => {
    const { data: marketingManagers, isLoading: isLoadingMM } = useGetUsersByRoleQuery('marketing_manager')
    const { data: marketingAssistants, isLoading: isLoadingMA } = useGetUsersByRoleQuery('marketing_assistant')
    const { data: graphicDesigners, isLoading: isLoadingGD } = useGetUsersByRoleQuery('graphics_designer')
    const { data: contentWriters, isLoading: isLoadingCW } = useGetUsersByRoleQuery('content_writer')

    // Optional: Add a simple schema to require all fields
  const validationSchema = Yup.object({
    teamName: Yup.string().required('Team name is required'),
    marketingManager: Yup.string().required('Marketing Manager is required'),
    marketingAssistant: Yup.string().required('Marketing Assistant is required'),
    graphicDesigner: Yup.string().required('Graphic Designer is required'),
    contentWriter: Yup.string().required('Content Writer is required'),
  });


    return (
        <>
            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                validateOnMount
            >
                {({ handleSubmit, isValid, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="row no-wrap no-gutter gap-0">
                            <div className='col-md-3'>
                                <h2>{heading}</h2>
                                <p>{subHeading}</p>
                            </div>
                            <FieldAndError
                                name="teamName"
                                placeholder="Team Name"
                                customClass="border-input"
                                parentClass="col-md-9 m-0"
                            />
                        </div>

                        <div className='row no-gutter gap-10 gap-row-40 mt-5 wrap'>
                            <div className='col-md-6'>
                                <SelectField
                                    label="Marketing Manager"
                                    name="marketingManager"
                                    placeholder="Select Marketing Manager"
                                    options={marketingManagers?.map(u => ({
                                        key: u.id,
                                        value: u.id,
                                        label: u.full_name
                                    }))}
                                    isLoading={isLoadingMM}
                                    className="teaf1"
                                />
                            </div>
                            <div className='col-md-6'>
                                <SelectField
                                    label="Marketing Assistant"
                                    name="marketingAssistant"
                                    placeholder="Select Marketing Assistant"
                                    options={marketingAssistants?.map(u => ({
                                        key: u.id,
                                        value: u.id,
                                        label: u.full_name
                                    }))}
                                    isLoading={isLoadingMA}
                                    className="teaf1"
                                />
                            </div>
                            <div className='col-md-6'>
                            <SelectField
                                    label="Graphic Designer"
                                    name="graphicDesigner"
                                    placeholder="Select Graphic Designer"
                                    options={graphicDesigners?.map(u => ({
                                        key: u.id,
                                        value: u.id,
                                        label: u.full_name
                                    }))}
                                    isLoading={isLoadingGD}
                                    className="teaf1"
                                />
                            </div>
                            <div className='col-md-6'>
                            <SelectField
                                    label="Content Writer"
                                    name="contentWriter"
                                    placeholder="Select Content Writer"
                                    options={contentWriters?.map(u => ({
                                        key: u.id,
                                        value: u.id,
                                        label: u.full_name
                                    }))}
                                    isLoading={isLoadingCW}
                                    className="teaf1"
                                />
                            </div>
                        </div>
                        <button type="submit" className='button-secondary mt-5' disabled={!isValid || isSubmitting}
                        >{isSubmitting ? 'Saving…' : buttontext}
                        </button>
                    </Form>
                )}
            </Formik>

        </>

    );
};

TeamForm.propTypes = {
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    heading: PropTypes.string,
    subHeading: PropTypes.string,
};

export default TeamForm;
