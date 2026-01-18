import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  GalleryVerticalEnd,
  Settings,
  User,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  border-radius: var(--radius);
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary);
    transform: scale(1.1);
  }
`;

const Credits = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: white;
  font-size: 0.875rem;
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

function Header() {
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(true);
  const [credits, setCredits] = React.useState(100);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/generate', label: 'Generate', icon: <Sparkles size={20} /> },
    { path: '/gallery', label: 'Gallery', icon: <GalleryVerticalEnd size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>
            <Zap size={24} />
          </LogoIcon>
          <span>AI Creator</span>
        </Logo>

        <NavLinks>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              active={location.pathname === item.path ? 1 : 0}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <UserActions>
          <Credits>
            <Zap size={16} />
            {credits} credits
          </Credits>
          
          <ActionButton onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </ActionButton>
          
          <ActionButton>
            <User size={20} />
          </ActionButton>
        </UserActions>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;