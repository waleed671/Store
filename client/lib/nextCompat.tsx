import React from 'react';
import { 
  Link as RouterLink, 
  useNavigate, 
  useLocation, 
  useParams as useReactParams, 
  useSearchParams as useReactSearchParams 
} from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    prefetch: () => {},
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useParams() {
  return useReactParams();
}

export function useSearchParams() {
  const [searchParams] = useReactSearchParams();
  return searchParams;
}

export const Link = ({ href, children, ...props }: any) => {
  return (
    <RouterLink to={href || '/'} {...props}>
      {children}
    </RouterLink>
  );
};
