/** @format */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  MapPin,
  School,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { eventService } from '../services/api';
import homecomingHero from '../assets/home/induction-homecoming-hero.jpg';
import schoolDays from '../assets/home/induction-school-days.jpg';
import brotherhood from '../assets/home/induction-brotherhood.jpg';

const selectInductionEvent = (payload) => {
  const events = Array.isArray(payload) ? payload : payload?.results ?? [];

  return (
    events
      .filter((event) =>
        String(event.title ?? '')
          .toLowerCase()
          .includes('induct'),
      )
      .sort((first, second) => {
        const firstDate = new Date(first.date).getTime();
        const secondDate = new Date(second.date).getTime();
        return firstDate - secondDate;
      })[0] ?? null
  );
};

const formatEventDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatEventTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/60 focus-visible:ring-offset-2';

const Induction = () => {
  const [inductionEvent, setInductionEvent] = useState(null);

  useEffect(() => {
    let isActive = true;

    eventService
      .getAll()
      .then(({ data }) => {
        if (isActive) {
          setInductionEvent(selectInductionEvent(data));
        }
      })
      .catch(() => {
        // Campaign copy remains useful while event details are being prepared.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const eventDate = formatEventDate(inductionEvent?.date);
  const eventTime = formatEventTime(inductionEvent?.date);
  const registrationPath = inductionEvent
    ? `/events/register/${inductionEvent.id}`
    : '/events';

  return (
    <div className='w-full overflow-hidden bg-[#f7f2e8] text-[#10243b]'>
      <section
        aria-labelledby='induction-title'
        className='relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-primary text-white'>
        <img
          src={homecomingHero}
          alt=''
          width='1774'
          height='887'
          fetchPriority='high'
          className='absolute inset-0 -z-30 h-full w-full object-cover object-[64%_center] sm:object-center'
          aria-hidden='true'
        />
        <div className='absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(0,24,52,0.98)_0%,rgba(0,39,78,0.92)_42%,rgba(0,35,69,0.58)_72%,rgba(0,19,39,0.48)_100%)]' />
        <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_13%_18%,rgba(255,215,0,0.19),transparent_31%)]' />
        <div
          className='absolute inset-0 -z-10 opacity-20'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px)',
            backgroundSize: '100% 52px',
          }}
        />

        <div className='mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:gap-10 lg:px-10 lg:py-24'>
          <div className='max-w-4xl'>
            <div className='mb-7 inline-flex items-center gap-3 rounded-full border border-secondary/50 bg-primary/45 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.22em] text-secondary backdrop-blur-sm sm:text-xs'>
              <span className='h-2 w-2 rounded-full bg-secondary shadow-[0_0_18px_rgba(255,215,0,.9)]' />
              Old Toms '16 presents
            </div>

            <h1
              id='induction-title'
              className='max-w-5xl font-black uppercase leading-[0.83] tracking-[-0.055em]'>
              <span className='block text-[clamp(1rem,2.1vw,1.65rem)] tracking-[0.28em] text-white/78'>
                The
              </span>
              <span className='block text-[clamp(2.25rem,8.4vw,6.75rem)] text-white'>
                Induction
              </span>
            </h1>

            <p className='mt-7 max-w-3xl text-2xl font-black leading-tight text-secondary sm:text-3xl md:text-4xl'>
              Come home. The next chapter starts with us.
            </p>
            <p className='mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8'>
              Ten years after we left the classrooms that shaped us, we return
              as brothers not simply to remember, but to build the network that
              will carry our class forward.
            </p>

            <div className='mt-9 flex flex-col gap-3 sm:flex-row'>
              <Link
                to={registrationPath}
                className={`${focusRing} inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-base font-black text-primary shadow-[0_14px_35px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 hover:bg-[#ffe04a]`}>
                I'm coming home
                <ArrowRight className='h-5 w-5' aria-hidden='true' />
              </Link>
              <a
                href='#why-we-return'
                className={`${focusRing} inline-flex min-h-12 items-center justify-center rounded-full border border-white/45 bg-white/8 px-7 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-primary`}>
                Why we return
              </a>
            </div>
          </div>

          <aside
            aria-label='Induction details'
            className='relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-[#071f3a]/80 p-6 shadow-2xl backdrop-blur-md sm:p-7'>
            <div className='absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-secondary/20 blur-2xl' />
            <div className='relative'>
              <p className='text-[0.68rem] font-black uppercase tracking-[0.24em] text-secondary'>
                Official invitation
              </p>
              <p className='mt-3 text-2xl font-black leading-tight'>
                {inductionEvent?.title ?? 'The Induction'}
              </p>
              <div className='my-6 border-t border-dashed border-white/25' />

              <div className='space-y-5'>
                <div className='flex gap-3'>
                  <CalendarDays
                    className='mt-0.5 h-5 w-5 shrink-0 text-secondary'
                    aria-hidden='true'
                  />
                  <div>
                    <p className='text-xs font-bold uppercase tracking-widest text-white/50'>
                      Date & time
                    </p>
                    {eventDate ? (
                      <time
                        dateTime={inductionEvent.date}
                        className='mt-1 block font-bold text-white'>
                        {eventDate} · {eventTime}
                      </time>
                    ) : (
                      <p className='mt-1 font-bold text-white'>
                        Details announcing soon
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex gap-3'>
                  <MapPin
                    className='mt-0.5 h-5 w-5 shrink-0 text-secondary'
                    aria-hidden='true'
                  />
                  <div>
                    <p className='text-xs font-bold uppercase tracking-widest text-white/50'>
                      Home ground
                    </p>
                    <p className='mt-1 font-bold text-white'>
                      {inductionEvent?.location ?? 'Venue to be announced'}
                    </p>
                  </div>
                </div>
              </div>

              <p className='mt-6 text-sm leading-6 text-white/60'>
                One class. One home. One new chapter.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <div className='bg-secondary text-primary'>
        <div className='mx-auto grid max-w-7xl grid-cols-1 divide-y divide-primary/15 px-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8'>
          {['One class', 'One home', 'One new chapter'].map((line) => (
            <p
              key={line}
              className='px-4 py-4 text-xs font-black uppercase tracking-[0.24em] sm:py-5'>
              {line}
            </p>
          ))}
        </div>
      </div>

      <section
        id='why-we-return'
        aria-labelledby='why-title'
        className='relative scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-10'>
        <div
          className='absolute inset-0 opacity-55'
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,51,102,.045) 1px, transparent 1px)',
            backgroundSize: '100% 42px',
          }}
          aria-hidden='true'
        />
        <div className='relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-20'>
          <div className='relative mx-auto w-full max-w-[520px] lg:mx-0'>
            <div className='absolute -left-3 -top-3 h-full w-full rounded-[2rem] border-2 border-secondary bg-secondary sm:-left-5 sm:-top-5' />
            <figure className='relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_28px_70px_rgba(0,39,78,.2)] sm:p-4'>
              <img
                src={schoolDays}
                alt='Illustrative scene of Ghanaian schoolboys studying and laughing together on campus'
                width='1023'
                height='1537'
                loading='lazy'
                decoding='async'
                className='aspect-[4/5] w-full rounded-[1.4rem] object-cover object-center'
              />
              <figcaption className='flex items-center justify-between gap-4 px-2 pb-1 pt-4 text-[0.67rem] font-black uppercase tracking-[0.19em] text-primary/65'>
                <span>Where the story began</span>
                <span>Class of 2016</span>
              </figcaption>
            </figure>
            <div className='absolute -bottom-7 -right-2 hidden h-28 w-28 rotate-6 items-center justify-center rounded-full border-4 border-[#f7f2e8] bg-primary p-3 shadow-xl sm:flex'>
              <img
                src='/logo.jpg'
                alt='Old Toms Class of 2016 crest'
                width='400'
                height='400'
                loading='lazy'
                decoding='async'
                className='h-full w-full rounded-full object-cover'
              />
            </div>
          </div>

          <div>
            <p className='text-xs font-black uppercase tracking-[0.24em] text-[#8a6a00]'>
              01 / Why we come home
            </p>
            <h2
              id='why-title'
              className='mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl'>
              Brotherhood needs more than memories.
              <span className='mt-2 block text-[#a07900]'>It needs presence.</span>
            </h2>
            <p className='mt-7 max-w-2xl text-lg leading-8 text-[#405065]'>
              Before the titles, careers and cities, we were boys in the same
              classrooms—learning discipline, chasing dreams and forming
              friendships that outlasted the final bell.
            </p>
            <p className='mt-5 max-w-2xl text-lg leading-8 text-[#405065]'>
              This induction is the day we turn memory into momentum:
              reconnecting our class, opening doors for one another and giving
              back to the school that gave us our start.
            </p>

            <div className='mt-10 grid gap-4 sm:grid-cols-3'>
              {[
                {
                  icon: UsersRound,
                  title: 'Reconnect',
                  copy: 'Put faces, stories and friendships back in the same room.',
                },
                {
                  icon: HeartHandshake,
                  title: 'Build',
                  copy: 'Create a network that shows up when a brother calls.',
                },
                {
                  icon: School,
                  title: 'Give back',
                  copy: 'Carry our shared start forward for those coming after us.',
                },
              ].map(({ icon: Icon, title, copy }) => (
                <article
                  key={title}
                  className='rounded-2xl border border-primary/10 bg-white/75 p-5 shadow-sm backdrop-blur-sm'>
                  <Icon className='h-6 w-6 text-[#a07900]' aria-hidden='true' />
                  <h3 className='mt-4 font-black text-primary'>{title}</h3>
                  <p className='mt-2 text-sm leading-6 text-[#59677a]'>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='story-title'
        className='relative bg-[#031f3f] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-10'>
        <div className='absolute inset-0 overflow-hidden' aria-hidden='true'>
          <div className='absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border-[80px] border-secondary/[0.04]' />
          <div className='absolute -bottom-48 -left-48 h-[30rem] w-[30rem] rounded-full border-[70px] border-white/[0.025]' />
        </div>
        <div className='relative mx-auto max-w-7xl'>
          <div className='max-w-4xl'>
            <p className='text-xs font-black uppercase tracking-[0.24em] text-secondary'>
              02 / Our story continues
            </p>
            <h2
              id='story-title'
              className='mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl'>
              We left as schoolboys.
              <span className='mt-2 block text-secondary'>We return as brothers.</span>
            </h2>
          </div>

          <div className='mt-14 grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch'>
            <figure className='group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl sm:min-h-[520px]'>
              <img
                src={brotherhood}
                alt='Illustrative scene of Ghanaian alumni warmly reuniting on a school veranda'
                width='1536'
                height='1024'
                loading='lazy'
                decoding='async'
                className='absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-[#00152d] via-transparent to-transparent' />
              <figcaption className='absolute inset-x-0 bottom-0 p-6 sm:p-9'>
                <p className='text-xs font-black uppercase tracking-[0.24em] text-secondary'>
                  Today
                </p>
                <p className='mt-3 max-w-xl text-2xl font-black sm:text-3xl'>
                  Many paths brought us here. One brotherhood brings us home.
                </p>
              </figcaption>
            </figure>

            <ol className='flex flex-col justify-between gap-4'>
              {[
                {
                  number: '01',
                  label: 'Then',
                  title: 'Before the titles, there was the classroom.',
                  copy: 'The same bell, the same yard, the same lessons in discipline, excellence and unity.',
                  icon: BookOpen,
                },
                {
                  number: '02',
                  label: 'Now',
                  title: 'The road took us across industries and continents.',
                  copy: 'What still connects every story is the place where all of ours began.',
                  icon: UsersRound,
                },
                {
                  number: '03',
                  label: 'Next',
                  title: 'Shared history becomes shared impact.',
                  copy: 'The induction begins a stronger network for our class, our school and the future.',
                  icon: Sparkles,
                },
              ].map(({ number, label, title, copy, icon: Icon }) => (
                <li
                  key={number}
                  className='grid grid-cols-[auto_1fr] gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5 sm:gap-5 sm:p-6'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-black text-primary'>
                    {number}
                  </div>
                  <div>
                    <div className='flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-secondary'>
                      <Icon className='h-4 w-4' aria-hidden='true' />
                      {label}
                    </div>
                    <h3 className='mt-2 text-xl font-black leading-snug'>{title}</h3>
                    <p className='mt-2 text-sm leading-6 text-white/65'>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='invitation-title'
        className='relative px-5 py-20 sm:px-8 sm:py-28 lg:px-10'>
        <div className='mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-20'>
          <div>
            <p className='text-xs font-black uppercase tracking-[0.24em] text-[#8a6a00]'>
              03 / The invitation
            </p>
            <h2
              id='invitation-title'
              className='mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl'>
              This is our roll call.
            </h2>
            <p className='mt-6 max-w-xl text-lg leading-8 text-[#405065]'>
              Every name matters. Every story belongs. Your presence turns a
              class year into a living brotherhood. Take your seat, bring your
              story and help shape what begins here.
            </p>
            <div className='mt-8 flex items-center gap-4'>
              <div className='h-px w-14 bg-[#b18a00]' />
              <p className='font-serif text-xl italic text-primary'>
                “Answer the call. Come home.”
              </p>
            </div>
          </div>

          <article className='relative overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_30px_80px_rgba(0,39,78,.18)]'>
            <div className='flex items-center justify-between gap-4 bg-primary px-6 py-5 text-white sm:px-8'>
              <div>
                <p className='text-[0.65rem] font-black uppercase tracking-[0.24em] text-secondary'>
                  Old Toms · Class of 2016
                </p>
                <p className='mt-1 text-xl font-black'>Official programme</p>
              </div>
              <img
                src='/logo.jpg'
                alt=''
                width='400'
                height='400'
                loading='lazy'
                decoding='async'
                className='h-12 w-12 rounded-full border-2 border-secondary object-cover'
                aria-hidden='true'
              />
            </div>

            <div className='p-6 sm:p-8'>
              <p className='text-3xl font-black leading-tight text-primary sm:text-4xl'>
                {inductionEvent?.title ?? 'The Induction'}
              </p>
              <p className='mt-4 max-w-2xl leading-7 text-[#5b6878]'>
                {inductionEvent?.description ??
                  'A homecoming, a celebration of brotherhood and the beginning of the network we will build together.'}
              </p>

              <dl className='mt-8 grid gap-5 border-y border-dashed border-primary/20 py-7 sm:grid-cols-3'>
                <div>
                  <dt className='text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#8a6a00]'>
                    Date
                  </dt>
                  <dd className='mt-2 font-black text-primary'>
                    {eventDate ?? 'To be announced'}
                  </dd>
                </div>
                <div>
                  <dt className='text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#8a6a00]'>
                    Time
                  </dt>
                  <dd className='mt-2 font-black text-primary'>
                    {eventTime ?? 'To be announced'}
                  </dd>
                </div>
                <div>
                  <dt className='text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#8a6a00]'>
                    Venue
                  </dt>
                  <dd className='mt-2 font-black text-primary'>
                    {inductionEvent?.location ?? 'To be announced'}
                  </dd>
                </div>
              </dl>

              <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
                <Link
                  to={registrationPath}
                  className={`${focusRing} inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-black text-white transition hover:-translate-y-0.5 hover:bg-[#00264d]`}>
                  {inductionEvent
                    ? 'Register for the induction'
                    : 'Get induction updates'}
                  <ArrowRight className='h-5 w-5' aria-hidden='true' />
                </Link>
                <Link
                  to='/events'
                  className={`${focusRing} inline-flex min-h-12 items-center justify-center rounded-full border border-primary/20 px-6 py-3.5 font-bold text-primary transition hover:border-primary hover:bg-primary/5`}>
                  All events
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className='relative isolate overflow-hidden bg-secondary px-5 py-20 text-primary sm:px-8 sm:py-24 lg:px-10'>
        <div className='absolute inset-y-0 right-0 -z-10 flex items-center text-[13rem] font-black leading-none text-white/20 sm:text-[20rem] lg:text-[28rem]'>
          16
        </div>
        <div className='mx-auto max-w-5xl text-center'>
          <p className='text-xs font-black uppercase tracking-[0.26em]'>
            St. Thomas Aquinas SHS · Class of 2016
          </p>
          <h2 className='mt-5 text-4xl font-black uppercase leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl'>
            Class of 2016,
            <span className='block'>answer the roll call.</span>
          </h2>
          <p className='mx-auto mt-6 max-w-2xl text-lg font-semibold leading-8 text-primary/75'>
            Take your place. Bring your story. Come home.
          </p>
          <Link
            to={registrationPath}
            className={`${focusRing} mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-black text-white shadow-[0_16px_35px_rgba(0,39,78,.24)] transition hover:-translate-y-0.5 hover:bg-[#00264d]`}>
            I'm coming home
            <ArrowRight className='h-5 w-5' aria-hidden='true' />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Induction;
