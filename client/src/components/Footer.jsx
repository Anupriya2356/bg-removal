import React from 'react'
import { assets } from '../assets/assets';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
    return (
        <div className='flex items-center justify-between gap-4 px-4 lg:px-44 py-3'>
            <img width={150} src={assets.logo} alt="" />
            <p className='flex-1 border-1 border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden'>All right reserved.</p>
            <div className='flex gap-3'>
                <a 
                    href="https://github.com/Anupriya2356" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-violet-600 transition-colors"
                >
                    <FiGithub size={24} />
                </a>
                <a 
                    href="https://www.linkedin.com/in/anupriya-gupta-a69b46301/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-violet-600 transition-colors"
                >
                    <FiLinkedin size={24} />
                </a>
                <a 
                    href="mailto:example@gmail.com"
                    className="text-gray-600 hover:text-violet-600 transition-colors"
                >
                    <FiMail size={24} />
                </a>
            </div>
        </div>
    )
}

export default Footer