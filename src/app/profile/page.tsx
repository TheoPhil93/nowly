const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
    useEffect(() => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token); // Wenn ein Token existiert, ist der Benutzer eingeloggt
    }, []);
  
    return (
      <header>
        <button
          onClick={() => {
            if (isLoggedIn) {
              router.push('/profile');
            } else {
              router.push('/login');
            }
          }}
        >
          {isLoggedIn ? 'Profil' : 'Login'}
        </button>
      </header>
    );
  };
  