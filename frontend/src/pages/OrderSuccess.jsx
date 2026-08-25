/** @format */

import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderSuccess = () => {
  const { id } = useParams();
  return (
    <div className='max-w-3xl mx-auto px-4 py-16 text-center'>
      <h1 className='text-3xl font-bold text-primary mb-4'>Thank you!</h1>
      <p className='mb-6'>
        Your order {id ? `#${id}` : ''} has been received. We'll be in touch
        with delivery/pickup details.
      </p>
      <Link to='/' className='text-secondary font-bold'>
        Return Home
      </Link>
    </div>
  );
};

export default OrderSuccess;
