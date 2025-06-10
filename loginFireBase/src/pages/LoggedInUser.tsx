import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import { AccountLinkingModal } from "../components/AccountLinkingModal";

export const LoggedInUser = () => {
  const { user, logout, linkWithGoogle, linkWithFacebook, linkWithPassword, error, isLoading, existingEmail, pendingCredential, clearError } = useFirebaseUser();
  const [userHasGoogle, setUserHasGoogle] = useState(false);
  const [userHasFacebook, setUserHasFacebook] = useState(false);
  const [userHasPassword, setUserHasPassword] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUserHasGoogle(user.providerData.some((profile) => profile.providerId === "google.com"));
    setUserHasFacebook(user.providerData.some((profile) => profile.providerId === "facebook.com"));
    setUserHasPassword(user.providerData.some((profile) => profile.providerId === "password"));
  }, [user]);

  const onAddEmailSignInClicked = () => {
    setShowLinkModal(true);
  };

  const handleLinkAccount = async (password: string) => {
    if (!user) return;
    await linkWithPassword(user.email || "", password);
    setShowLinkModal(false);
  };

  return (
    <Card>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <h1 className="text-2xl font-bold">Welcome to the dashboard {user?.displayName}!</h1>
        <div className="mt-2">
          <b>Your email is:</b> {user?.email}
        </div>
        <div className="mt-4">
          Add additional login methods:
          {!userHasGoogle && (
            <div>
              <Button variant="google" className="mt-3" onClick={linkWithGoogle} isLoading={isLoading}>
                Add Google Sign In
              </Button>
            </div>
          )}
          {!userHasFacebook && (
            <div>
              <Button variant="facebook" className="mt-3" onClick={linkWithFacebook} isLoading={isLoading}>
                Add Facebook Sign In
              </Button>
            </div>
          )}
          {!userHasPassword && (
            <div>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={onAddEmailSignInClicked}
                disabled={isLoading}
              >
                Add Email Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>
        <Button variant="primary" className="mt-3" onClick={logout} isLoading={isLoading}>
          Logout
        </Button>
      </div>

      {showLinkModal && user && (
        <AccountLinkingModal
          email={user.email || ""}
          onLinkAccount={handleLinkAccount}
          onCancel={() => setShowLinkModal(false)}
          isLoading={isLoading}
        />
      )}
      {existingEmail && pendingCredential && (
        <AccountLinkingModal
          email={existingEmail}
          onLinkAccount={async (password) => {
            await linkWithPassword(existingEmail, password);
            clearError();
          }}
          onCancel={clearError}
          isLoading={isLoading}
        />
      )}
    </Card>
  );
};