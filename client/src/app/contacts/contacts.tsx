'use client';

import { useMutation } from '@tanstack/react-query';
import { Formik } from 'formik';
import mailgo from 'mailgo';
import { useEffect } from 'react';
import { object, string } from 'yup';

import MailIcon from '@/assets/envelope.svg';
import GithubIcon from '@/assets/github.svg';
import { FeedbackInput } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';

const validationSchema = object().shape({
  email: string().email('Invalid email address').required('The field is required'),
  text: string().max(10000).required('The field is required'),
});

const Contacts = () => {
  const { mutateAsync: sendFeedback, data } = useMutation((input: FeedbackInput) =>
    getGQLClient().sendFeedback({ input }),
  );

  const isSuccess = data?.feedback?.success;
  useEffect(() => {
    mailgo();
  }, []);

  return (
    <div className="flex flex-col items-center p-4 pt-8">
      <div>
        <a
          className="inline-flex items-baseline underline hover:text-primary"
          href="https://github.com/flytaly/rssdt"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon className="h-4 w-auto self-center mr-1" />
          GitHub
        </a>
        <div>
          <a
            className="inline-flex items-baseline underline hover:text-primary mt-3"
            href="mailto:support@rssdt.com"
          >
            <MailIcon className="h-4 w-auto self-center mr-1" />
            <span>Write me</span>
          </a>
          <span> of use the form below</span>
        </div>
      </div>
      <Formik
        validationSchema={validationSchema}
        initialValues={{ email: '', text: '' }}
        onSubmit={async (input, actions) => {
          actions.setSubmitting(true);
          try {
            const result = await sendFeedback(input);
            if (result.feedback?.success) actions.resetForm();
            const errors = result.feedback?.errors;
            if (errors) {
              const err = errors[0];
              if (err.argument === 'email') actions.setErrors({ email: err.message });
              else actions.setErrors({ text: err.message });
            }
          } catch (error) {
            console.log('error:', error);
            actions.setErrors({ text: (error as { message: string })?.message });
          }
          actions.setSubmitting(false);
          actions.setStatus({ success: true });
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
          const emailError = touched.email && errors.email;
          const textError = touched.text && errors.text;
          let btnText = isSubmitting ? 'Submitting...' : 'Submit';
          const wasSubmitted = isSuccess && !values.text && !values.email;
          if (wasSubmitted) btnText = 'submitted';
          return (
            <form
              action="#"
              method="post"
              className="flex flex-col items-center w-full max-w-md mt-5"
              onSubmit={handleSubmit}
            >
              <div className="w-full">
                <input
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`px-2 shadow-input-gray hover:shadow-input-primary w-full rounded-sm ${
                    emailError ? 'shadow-input-error' : ''
                  }`}
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  disabled={isSubmitting}
                />
                <div className="text-error mt-1">{emailError || <>&nbsp;</>}</div>
              </div>
              <div className="w-full mt-1">
                <textarea
                  value={values.text}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`px-2 w-full shadow-input-gray hover:shadow-input-primary rounded-sm ${
                    textError ? 'shadow-input-error' : ''
                  }`}
                  name="text"
                  id="text"
                  cols={10}
                  rows={5}
                  placeholder="Feedback"
                  maxLength={10000}
                  disabled={isSubmitting}
                />
                <div className="text-error mt-1">{textError || <>&nbsp;</>}</div>
              </div>
              <button
                type="submit"
                className={`btn ${wasSubmitted ? 'bg-tertiary' : 'bg-secondary'}`}
                disabled={isSubmitting}
              >
                {btnText}
              </button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Contacts;
