import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from './input';
import RssSquareIcon from '../../../public/static/rss-square.svg';
import MailIcon from '../../../public/static/envelope.svg';
import ClockIcon from '../../../public/static/clock.svg';
import Select from './select';
import { periodNames as names, DigestSchedule } from '../../types';
import { useAddFeedWithEmailMutation } from '../../generated/graphql';

// VALIDATION
const AddFeedSchema = Yup.object().shape({
  url: Yup.string().url('Invalid feed address').required('The field is required'),
  email: Yup.string().email('Invalid email address').required('The field is required'),
});

const getUserInfo = () => {
  if (Intl && Intl.DateTimeFormat) {
    const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
    return { timeZone, locale };
  }
  return null;
};

interface AddFeedFormProps {
  email?: string;
}

const AddFeedForm: React.FC<AddFeedFormProps> = ({ email = '' }) => {
  const [addFeed] = useAddFeedWithEmailMutation();
  return (
    <Formik
      initialValues={{ email: '', url: 'https://', digest: DigestSchedule.daily }}
      validationSchema={AddFeedSchema}
      onSubmit={async (formVariables, { setSubmitting, resetForm }) => {
        try {
          const { data } = await addFeed({
            variables: {
              input: { email: formVariables.email, feedUrl: formVariables.url },
              userInfo: getUserInfo(),
              feedOpts: { schedule: formVariables.digest },
            },
          });
          if (data?.addFeedWithEmail?.userFeed) {
            console.log('success');
            // setMessages({ success: 'success' });
          } else {
            console.error(data?.addFeedWithEmail?.errors);
            // setMessages({ error: data?.addFeedWithEmail?.errors?.[0].message });
          }

          resetForm();
        } catch (err) {
          console.error({ error: err.message });
          // setMessages({ error: err.message });
        }
        setSubmitting(false);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <Input
            id="url"
            type="url"
            IconSVG={RssSquareIcon}
            placeholder="https://..."
            value={values.url}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.url}
            error={errors.url}
            title="The RSS or Atom feed url"
            required
          />
          <Input
            id="email"
            type="email"
            IconSVG={MailIcon}
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.email}
            error={errors.email}
            disabled={isSubmitting || !!email}
            title="Email address"
            required
          />
          <Select
            id="digest"
            IconSVG={ClockIcon}
            defaultValue={DigestSchedule.daily}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.digest}
          >
            {Object.values(DigestSchedule).map((sc) => (
              <option key={sc} value={sc}>{`${names[sc]} digest`}</option>
            ))}
          </Select>
          <button
            type="submit"
            className="btn w-full text-xl tracking-wider"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'loading...' : 'subscribe'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default AddFeedForm;
