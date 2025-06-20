import { useState } from "react";
import { List } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useFirebaseUser } from "../hooks/useFirebaseUser";

const Menu = () => {
  const { user, logout } = useFirebaseUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 text-xl font-semibold">Login Firebase</div>

          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <List size={24} />
            </button>
          </div>

          <div className="hidden sm:flex sm:space-x-6">
            <Link to="/" className="hover:text-gray-300">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/posts" className="hover:text-gray-300">
                  Posts
                </Link>
                <button onClick={logout} className="hover:text-gray-300">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-300">
                  Login
                </Link>
                <Link to="/register" className="hover:text-gray-300">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden px-4 pb-3 space-y-2">
          <Link to="/" className="block text-gray-300 hover:text-white">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/posts" className="block text-gray-300 hover:text-white">
                Posts
              </Link>
              <button onClick={logout} className="block text-gray-300 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-300 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="block text-gray-300 hover:text-white">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Menu;