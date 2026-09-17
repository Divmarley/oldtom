/** @format */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/api';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  School,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const FALLBACK_BATCH_YEARS = Array.from(
  { length: CURRENT_YEAR - 1950 + 1 },
  (_, index) => CURRENT_YEAR - index,
);

const ATTENDEE_TYPES = [
  {
    value: 'old_student',
    label: 'Old student',
    description: 'I attended St. Thomas Aquinas SHS.',
    icon: GraduationCap,
  },
  {
    value: 'sister_school',
    label: 'Sister school',
    description: 'I am joining from an invited sister school.',
    icon: Users,
  },
  {
    value: 'other_school',
    label: 'Another school',
    description: 'I am joining the celebration from another school.',
    icon: Building2,
  },
];

const FIELD_DETAILS = {
  attendee_type: {
    id: 'registration-attendee-type',
    label: 'How you are joining',
  },
  name: { id: 'registration-name', label: 'Full name' },
  email: { id: 'registration-email', label: 'Email address' },
  phone: { id: 'registration-phone', label: 'Phone number' },
  batch_year: { id: 'registration-batch-year', label: 'Year group' },
  alumni_id: { id: 'registration-alumni-id', label: 'Alumni ID' },
  school: { id: 'registration-school', label: 'Sister school' },
  other_school_name: {
    id: 'registration-other-school',
    label: 'School name',
  },
  notes: { id: 'registration-notes', label: 'Additional notes' },
};

const inputClassName =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60';
const invalidInputClassName = 'border-red-400 bg-red-50 focus:border-red-500';

const messagesFromValue = (value) => {
  if (Array.isArray(value)) return value.flatMap(messagesFromValue);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(messagesFromValue);
  }
  return typeof value === 'string' && value.trim() ? [value.trim()] : [];
};

const getThrottleMessage = (error) => {
  const retryAfter = Number(error.response?.headers?.['retry-after']);
  if (!Number.isFinite(retryAfter) || retryAfter <= 0) {
    return 'Too many registration attempts. Please wait a moment and try again.';
  }

  if (retryAfter < 60) {
    return `Too many registration attempts. Try again in ${Math.ceil(retryAfter)} seconds.`;
  }

  return `Too many registration attempts. Try again in about ${Math.ceil(retryAfter / 60)} minutes.`;
};

const parseSubmissionError = (error) => {
  if (error.response?.status === 429) {
    return { summary: getThrottleMessage(error), fields: {} };
  }

  const responseData = error.response?.data;
  if (!responseData) {
    return {
      summary: 'Something went wrong. Please check your connection and try again.',
      fields: {},
    };
  }
  if (typeof responseData === 'string') {
    return { summary: responseData, fields: {} };
  }

  const fields = {};
  const generalMessages = [];
  Object.entries(responseData).forEach(([field, value]) => {
    const messages = messagesFromValue(value);
    if (!messages.length) return;
    if (FIELD_DETAILS[field]) {
      fields[field] = messages[0];
    } else {
      generalMessages.push(...messages);
    }
  });

  return {
    summary:
      generalMessages[0] ||
      (Object.keys(fields).length
        ? 'Please review the highlighted details and try again.'
        : 'Registration could not be completed. Please try again.'),
    fields,
  };
};

const EventRegistration = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registrationOptions, setRegistrationOptions] = useState({
    sisterSchools: [],
    batchYears: FALLBACK_BATCH_YEARS,
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    attendee_type: '',
    name: '',
    email: '',
    phone: '',
    batch_year: '',
    alumni_id: '',
    school: '',
    other_school_name: '',
    notes: '',
  });

  const fetchRegistrationOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError('');
    try {
      const response = await eventService.getRegistrationOptions();
      const sisterSchools = Array.isArray(response.data?.sister_schools)
        ? response.data.sister_schools.filter(
            (school) => school?.id !== undefined && school?.name,
          )
        : [];
      const serverBatchYears = Array.isArray(response.data?.batch_years)
        ? response.data.batch_years
            .map(Number)
            .filter((year) => Number.isInteger(year))
        : [];

      setRegistrationOptions({
        sisterSchools,
        batchYears: [...new Set([...serverBatchYears, ...FALLBACK_BATCH_YEARS])]
          .sort((a, b) => b - a),
      });
    } catch {
      setRegistrationOptions({
        sisterSchools: [],
        batchYears: FALLBACK_BATCH_YEARS,
      });
      setOptionsError(
        'We could not load the sister-school list. Please retry or choose another registration type.',
      );
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const normalizedValue = String(name || '').trim();
        let response;
        if (!normalizedValue) throw new Error('Event reference is missing');

        if (/^\d+$/.test(normalizedValue)) {
          response = await eventService.getById(normalizedValue);
        } else {
          response = await eventService.getByName(normalizedValue);
        }
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchEvent();
  }, [name]);

  useEffect(() => {
    const optionsTimer = window.setTimeout(() => {
      void fetchRegistrationOptions();
    }, 0);

    return () => window.clearTimeout(optionsTimer);
  }, [fetchRegistrationOptions]);

  const clearFieldError = (field) => {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleChange = (e) => {
    const { name: field, value } = e.target;
    setFormData((currentData) => ({ ...currentData, [field]: value }));
    clearFieldError(field);
  };

  const handleAttendeeTypeChange = (e) => {
    setFormData((currentData) => ({
      ...currentData,
      attendee_type: e.target.value,
      batch_year: '',
      alumni_id: '',
      school: '',
      other_school_name: '',
    }));
    setSubmissionError('');
    setFieldErrors({});
  };

  const inputClasses = (field) =>
    `${inputClassName} ${fieldErrors[field] ? invalidInputClassName : ''}`;
  const errorDescription = (field) =>
    fieldErrors[field] ? `${FIELD_DETAILS[field].id}-error` : undefined;
  const renderFieldError = (field) =>
    fieldErrors[field] ? (
      <p
        id={`${FIELD_DETAILS[field].id}-error`}
        className='mt-2 text-sm font-semibold text-red-600'>
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError('');
    setFieldErrors({});

    const registrationData = {
      event: Number(event.id),
      attendee_type: formData.attendee_type,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim(),
    };
    if (formData.attendee_type === 'old_student') {
      registrationData.batch_year = Number(formData.batch_year);
      if (formData.alumni_id.trim()) {
        registrationData.alumni_id = formData.alumni_id.trim();
      }
    } else if (formData.attendee_type === 'sister_school') {
      registrationData.school = Number(formData.school);
    } else if (formData.attendee_type === 'other_school') {
      registrationData.other_school_name = formData.other_school_name.trim();
    }

    try {
      await eventService.register(registrationData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(
        'Error registering for event:',
        error.response?.data || error.message,
      );
      const parsedError = parseSubmissionError(error);
      setSubmissionError(parsedError.summary);
      setFieldErrors(parsedError.fields);
      window.requestAnimationFrame(() => {
        document.getElementById('registration-error-summary')?.focus();
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div role='status' className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
          <span className='sr-only'>Loading event details</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          Event Not Found
        </h2>
        <button
          type='button'
          onClick={() => navigate('/events')}
          className='text-primary font-bold flex items-center hover:underline'>
          <ArrowLeft className='mr-2 h-5 w-5' aria-hidden='true' /> Back to
          Events
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-xl text-center'>
          <div className='bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <CheckCircle
              className='h-10 w-10 text-green-600'
              aria-hidden='true'
            />
          </div>
          <h2 className='text-3xl font-bold text-primary mb-4'>
            Registration received
          </h2>
          <p className='text-gray-600 mb-8'>
            Thank you for registering for <strong>{event.title}</strong>. Your
            details are pending verification and review. We will email you when
            your registration status changes and send an official invitation if
            it is approved.
          </p>
          <button
            type='button'
            onClick={() => navigate('/events')}
            className='bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary'>
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  const sisterSchoolUnavailable =
    formData.attendee_type === 'sister_school' &&
    (optionsLoading ||
      Boolean(optionsError) ||
      registrationOptions.sisterSchools.length === 0);

  return (
    <div className='bg-[#f9fafb] min-h-screen pb-20'>
      <div className='bg-primary text-white py-12 px-4'>
        <div className='max-w-4xl mx-auto'>
          <button
            type='button'
            onClick={() => navigate('/events')}
            className='flex items-center text-secondary mb-6 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded'>
            <ArrowLeft className='mr-2 h-4 w-4' aria-hidden='true' /> Back to
            Events
          </button>
          <h1 className='text-4xl font-black mb-2 uppercase tracking-tight'>
            Join the celebration
          </h1>
          <p className='text-gray-300 text-lg'>
            Register your place for {event.title}
          </p>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 -mt-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100'>
              {submissionError && (
                <div
                  id='registration-error-summary'
                  role='alert'
                  tabIndex={-1}
                  className='mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 outline-none focus:ring-2 focus:ring-red-400'>
                  <div className='flex items-start gap-3'>
                    <AlertCircle
                      className='mt-0.5 h-5 w-5 shrink-0'
                      aria-hidden='true'
                    />
                    <div>
                      <p className='font-bold'>{submissionError}</p>
                      {Object.keys(fieldErrors).length > 0 && (
                        <ul className='mt-2 list-disc space-y-1 pl-5 text-sm'>
                          {Object.entries(fieldErrors).map(([field, message]) => (
                            <li key={field}>
                              <a
                                href={`#${FIELD_DETAILS[field].id}`}
                                className='underline underline-offset-2'>
                                {FIELD_DETAILS[field].label}: {message}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-6'>
                <fieldset
                  id='registration-attendee-type'
                  aria-describedby={
                    fieldErrors.attendee_type
                      ? 'registration-attendee-type-help registration-attendee-type-error'
                      : 'registration-attendee-type-help'
                  }>
                  <legend className='text-lg font-black text-primary'>
                    How are you joining the celebration?
                  </legend>
                  <p
                    id='registration-attendee-type-help'
                    className='mt-1 text-sm text-gray-500'>
                    Choose the option that best describes you. We will verify the
                    details before approval.
                  </p>
                  <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    {ATTENDEE_TYPES.map((attendeeType) => {
                      const Icon = attendeeType.icon;
                      const selected =
                        formData.attendee_type === attendeeType.value;
                      return (
                        <label
                          key={attendeeType.value}
                          className={`relative flex min-h-32 cursor-pointer flex-col rounded-2xl border p-4 transition-all focus-within:ring-4 focus-within:ring-secondary/40 ${
                            selected
                              ? 'border-primary bg-primary text-white shadow-lg'
                              : 'border-gray-200 bg-gray-50 text-primary hover:border-primary/40'
                          }`}>
                          <input
                            type='radio'
                            name='attendee_type'
                            value={attendeeType.value}
                            checked={selected}
                            onChange={handleAttendeeTypeChange}
                            required
                            className='sr-only'
                          />
                          <div className='flex items-center justify-between'>
                            <Icon
                              className={`h-6 w-6 ${selected ? 'text-secondary' : 'text-primary'}`}
                              aria-hidden='true'
                            />
                            {selected && (
                              <CheckCircle
                                className='h-5 w-5 text-secondary'
                                aria-hidden='true'
                              />
                            )}
                          </div>
                          <span className='mt-3 font-black'>
                            {attendeeType.label}
                          </span>
                          <span
                            className={`mt-1 text-xs leading-5 ${selected ? 'text-white/75' : 'text-gray-500'}`}>
                            {attendeeType.description}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {renderFieldError('attendee_type')}
                </fieldset>

                {formData.attendee_type === 'old_student' && (
                  <section
                    aria-labelledby='old-student-details-title'
                    className='rounded-2xl border border-primary/10 bg-primary/5 p-5'>
                    <div className='mb-5 flex items-start gap-3'>
                      <div className='rounded-xl bg-primary p-2.5 text-secondary'>
                        <School className='h-5 w-5' aria-hidden='true' />
                      </div>
                      <div>
                        <h2
                          id='old-student-details-title'
                          className='font-black text-primary'>
                          St. Thomas Aquinas SHS old student
                        </h2>
                        <p className='mt-1 text-sm text-gray-600'>
                          We will match your year group and Alumni ID, when
                          supplied, against the alumni database.
                        </p>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                      <div>
                        <label
                          htmlFor='registration-batch-year'
                          className='mb-2 block font-bold text-gray-700'>
                          Year group / graduating batch
                        </label>
                        <select
                          id='registration-batch-year'
                          name='batch_year'
                          required
                          value={formData.batch_year}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.batch_year)}
                          aria-describedby={errorDescription('batch_year')}
                          className={inputClasses('batch_year')}>
                          <option value=''>Select your year</option>
                          {registrationOptions.batchYears.map((year) => (
                            <option key={year} value={year}>
                              Class of {year}
                            </option>
                          ))}
                        </select>
                        {renderFieldError('batch_year')}
                      </div>
                      <div>
                        <label
                          htmlFor='registration-alumni-id'
                          className='mb-2 flex items-center font-bold text-gray-700'>
                          <ShieldCheck
                            className='mr-2 h-4 w-4 text-primary'
                            aria-hidden='true'
                          />
                          Alumni ID <span className='ml-1 font-normal'>(optional)</span>
                        </label>
                        <input
                          id='registration-alumni-id'
                          type='text'
                          name='alumni_id'
                          value={formData.alumni_id}
                          onChange={handleChange}
                          autoComplete='off'
                          maxLength={50}
                          aria-invalid={Boolean(fieldErrors.alumni_id)}
                          aria-describedby={errorDescription('alumni_id')}
                          className={inputClasses('alumni_id')}
                          placeholder='Enter your Alumni ID'
                        />
                        {renderFieldError('alumni_id')}
                      </div>
                    </div>
                  </section>
                )}

                {formData.attendee_type === 'sister_school' && (
                  <section
                    aria-labelledby='sister-school-details-title'
                    className='rounded-2xl border border-primary/10 bg-primary/5 p-5'>
                    <h2
                      id='sister-school-details-title'
                      className='font-black text-primary'>
                      Choose your sister school
                    </h2>
                    <p className='mt-1 text-sm text-gray-600'>
                      Select the school you are representing at the celebration.
                    </p>

                    {optionsError ? (
                      <div
                        role='status'
                        className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
                        <p>{optionsError}</p>
                        <button
                          type='button'
                          onClick={fetchRegistrationOptions}
                          disabled={optionsLoading}
                          className='mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white disabled:opacity-60'>
                          <RefreshCw
                            className={`h-4 w-4 ${optionsLoading ? 'animate-spin' : ''}`}
                            aria-hidden='true'
                          />
                          Retry school list
                        </button>
                      </div>
                    ) : (
                      <div className='mt-4'>
                        <label
                          htmlFor='registration-school'
                          className='mb-2 block font-bold text-gray-700'>
                          Sister school
                        </label>
                        <select
                          id='registration-school'
                          name='school'
                          required
                          disabled={
                            optionsLoading ||
                            registrationOptions.sisterSchools.length === 0
                          }
                          value={formData.school}
                          onChange={handleChange}
                          aria-invalid={Boolean(fieldErrors.school)}
                          aria-describedby={
                            fieldErrors.school
                              ? 'registration-school-help registration-school-error'
                              : 'registration-school-help'
                          }
                          className={inputClasses('school')}>
                          <option value=''>
                            {optionsLoading
                              ? 'Loading sister schools…'
                              : 'Select your school'}
                          </option>
                          {registrationOptions.sisterSchools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </select>
                        <p
                          id='registration-school-help'
                          className='mt-2 text-sm text-gray-500'>
                          {optionsLoading
                            ? 'Please wait while the approved school list loads.'
                            : registrationOptions.sisterSchools.length === 0
                              ? 'No sister schools are listed yet. Retry or choose “Another school”.'
                              : 'Only schools in the approved sister-school list appear here.'}
                        </p>
                        {renderFieldError('school')}
                        {!optionsLoading &&
                          registrationOptions.sisterSchools.length === 0 && (
                            <button
                              type='button'
                              onClick={fetchRegistrationOptions}
                              className='mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white'>
                              <RefreshCw
                                className='h-4 w-4'
                                aria-hidden='true'
                              />
                              Retry school list
                            </button>
                          )}
                      </div>
                    )}
                  </section>
                )}

                {formData.attendee_type === 'other_school' && (
                  <section
                    aria-labelledby='other-school-details-title'
                    className='rounded-2xl border border-primary/10 bg-primary/5 p-5'>
                    <h2
                      id='other-school-details-title'
                      className='font-black text-primary'>
                      Tell us your school
                    </h2>
                    <p className='mt-1 text-sm text-gray-600'>
                      Enter the full official name so the organisers can verify
                      it.
                    </p>
                    <div className='mt-4'>
                      <label
                        htmlFor='registration-other-school'
                        className='mb-2 block font-bold text-gray-700'>
                        School name
                      </label>
                      <input
                        id='registration-other-school'
                        type='text'
                        name='other_school_name'
                        required
                        value={formData.other_school_name}
                        onChange={handleChange}
                        autoComplete='organization'
                        maxLength={255}
                        aria-invalid={Boolean(fieldErrors.other_school_name)}
                        aria-describedby={errorDescription('other_school_name')}
                        className={inputClasses('other_school_name')}
                        placeholder='Full name of your school'
                      />
                      {renderFieldError('other_school_name')}
                    </div>
                  </section>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div>
                    <label
                      htmlFor='registration-name'
                      className='block text-gray-700 font-bold mb-2 flex items-center'>
                      <User
                        className='h-4 w-4 mr-2 text-primary'
                        aria-hidden='true'
                      />{' '}
                      Full Name
                    </label>
                    <input
                      id='registration-name'
                      type='text'
                      name='name'
                      required
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete='name'
                      maxLength={255}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={errorDescription('name')}
                      className={inputClasses('name')}
                      placeholder='Enter your full name'
                    />
                    {renderFieldError('name')}
                  </div>
                  <div>
                    <label
                      htmlFor='registration-email'
                      className='block text-gray-700 font-bold mb-2 flex items-center'>
                      <Mail
                        className='h-4 w-4 mr-2 text-primary'
                        aria-hidden='true'
                      />{' '}
                      Email Address
                    </label>
                    <input
                      id='registration-email'
                      type='email'
                      name='email'
                      required
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete='email'
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={errorDescription('email')}
                      className={inputClasses('email')}
                      placeholder='your@email.com'
                    />
                    {renderFieldError('email')}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='registration-phone'
                    className='block text-gray-700 font-bold mb-2 flex items-center'>
                    <Phone
                      className='h-4 w-4 mr-2 text-primary'
                      aria-hidden='true'
                    />{' '}
                    Phone Number
                  </label>
                  <input
                    id='registration-phone'
                    type='tel'
                    name='phone'
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete='tel'
                    inputMode='tel'
                    maxLength={20}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={errorDescription('phone')}
                    className={inputClasses('phone')}
                    placeholder='+233...'
                  />
                  {renderFieldError('phone')}
                </div>

                <div>
                  <label
                    htmlFor='registration-notes'
                    className='block text-gray-700 font-bold mb-2 flex items-center'>
                    <FileText
                      className='h-4 w-4 mr-2 text-primary'
                      aria-hidden='true'
                    />{' '}
                    Additional Notes
                  </label>
                  <textarea
                    id='registration-notes'
                    name='notes'
                    rows='3'
                    value={formData.notes}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.notes)}
                    aria-describedby={errorDescription('notes')}
                    className={`${inputClasses('notes')} resize-none`}
                    placeholder='Dietary requirements or special requests…'
                  />
                  {renderFieldError('notes')}
                </div>

                <button
                  type='submit'
                  disabled={submitting || sisterSchoolUnavailable}
                  className='w-full min-h-14 bg-primary text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary'>
                  {submitting ? (
                    <>
                      <span
                        className='h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin'
                        aria-hidden='true'
                      />
                      <span className='sr-only'>Submitting registration</span>
                    </>
                  ) : (
                    'Submit for verification'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className='lg:col-span-1'>
            <div className='bg-secondary/10 border border-secondary/20 rounded-3xl p-6 sticky top-24'>
              {event.image && (
                <div className='mb-6 rounded-2xl overflow-hidden h-40 shadow-sm'>
                  <img
                    src={event.image}
                    alt={event.title}
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
              <h3 className='text-primary font-black text-xl mb-6 uppercase tracking-tight'>
                Event Details
              </h3>

              <div className='space-y-6'>
                <div className='flex items-start'>
                  <div className='bg-white p-3 rounded-xl shadow-sm mr-4'>
                    <Calendar
                      className='h-6 w-6 text-primary'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 uppercase font-bold tracking-wider'>
                      Date & Time
                    </p>
                    <p className='text-primary font-bold'>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <div className='bg-white p-3 rounded-xl shadow-sm mr-4'>
                    <MapPin
                      className='h-6 w-6 text-primary'
                      aria-hidden='true'
                    />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500 uppercase font-bold tracking-wider'>
                      Location
                    </p>
                    <p className='text-primary font-bold'>{event.location}</p>
                  </div>
                </div>
              </div>

              <div className='mt-10 p-4 bg-primary rounded-2xl text-white'>
                <p className='text-sm font-medium opacity-80 mb-2 italic'>
                  Verification note:
                </p>
                <p className='text-sm leading-relaxed'>
                  The organisers will review your school or alumni details before
                  confirming your place and issuing an invitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;
