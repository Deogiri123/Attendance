import React, {useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [currentState, setCurrentState] = useState('Sign Up');
  const navigate = useNavigate();
  const { token, setToken, backendUrl } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try { 
      if (currentState === 'Sign Up') { 
        // Sign Up logic 
        const response = await axios.post(`${backendUrl}/api/user/register`, { 
          name, 
          email, 
          password 
        }); 
        
        if (response.data.success) { 
          setToken(response.data.token); 
          localStorage.setItem('token', response.data.token); 
          toast?.success?.('Registration successful!'); 
        } else { 
          toast?.error?.(response.data.message || 'Registration failed'); 
        } 
      } else { 
        // Login logic 
        const response = await axios.post(`${backendUrl}/api/user/login`, { 
          email, 
          password 
        }); 
        
        if (response.data.success) { 
          setToken(response.data.token); 
          localStorage.setItem('token', response.data.token); 
          toast?.success?.('Login successful!'); 
        } else { 
          toast?.error?.(response.data.message || 'Login failed'); 
        } 
      } 
    } catch (error: any) { 
      console.error('Authentication error:', error); 
      toast?.error?.( 
        error.response?.data?.message || 
        error.message || 
        'An error occurred during authentication' 
      ); 
    } finally { 
      setIsLoading(false); 
    } 
  }

  useEffect(() => { 
    if (token) { 
      navigate('/'); 
    } 
  }, [token, navigate]);

  const toggleAuthState = () => { 
    setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login'); 
    setName(''); 
    setEmail(''); 
    setPassword(''); 
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'
    >
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {currentState === 'Sign Up' && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Name'
          required
        />
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
        required
      />

      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Password'
        required
        minLength={6}
      />

      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Forgot your password?</p>
        <p
          onClick={toggleAuthState}
          className='cursor-pointer'
        >
          {currentState === 'Login' ? 'Create account' : 'Login Here'}
        </p>
      </div>

      <button
        type="submit"
        className='bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50'
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Login;