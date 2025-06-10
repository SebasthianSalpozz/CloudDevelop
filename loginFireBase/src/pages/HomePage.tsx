import { Container } from "../components/Container";
import Menu from "../components/Menu";
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import { LoggedInUser } from "./LoggedInUser";
import { GuestUser } from "./GuestUser";

const HomePage = () => {
  const { user } = useFirebaseUser();
  return (
    <>
      <Menu />
      <Container>{user ? <LoggedInUser /> : <GuestUser />}</Container>
    </>
  );
};

export default HomePage;