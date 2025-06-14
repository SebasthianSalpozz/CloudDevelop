import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { AccountLinkingModal } from "../components/AccountLinkingModal";
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Input } from "../components/Input";

export const LoggedInUser = () => {
  const {
    user,
    logout,
    linkWithGoogle,
    linkWithFacebook,
    linkWithPassword,
    error,
    isLoading,
    existingEmail,
    pendingCredential,
    clearError,
    updateUserProfile,
  } = useFirebaseUser();

  const [userHasGoogle, setUserHasGoogle] = useState(false);
  const [userHasFacebook, setUserHasFacebook] = useState(false);
  const [userHasPassword, setUserHasPassword] = useState(false);
  const [profile, setProfile] = useState<{
    fullName?: string;
    address?: string;
    birthdate?: string;
    age?: number;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");

  useEffect(() => {
    if (!user) return;
    setUserHasGoogle(
      user.providerData.some((p) => p.providerId === "google.com")
    );
    setUserHasFacebook(
      user.providerData.some((p) => p.providerId === "facebook.com")
    );
    setUserHasPassword(
      user.providerData.some((p) => p.providerId === "password")
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "UserInformation", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data as any);
        setAddress(data.address || "");
        setBirthdate(data.birthdate?.slice(0, 10) || "");
      }
    })();
  }, [user]);

  const handleLinkAccount = async (password: string) => {
    if (!user) return;
    await linkWithPassword(user.email || "", password);
    setShowLinkModal(false);
  };

  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <Card>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h1 className="text-2xl font-bold mb-2">
        ¡Bienvenido
        {profile?.fullName
          ? `, ${profile.fullName}`
          : `, ${user?.displayName}`}!
      </h1>
      <p className="mb-4">
        <b>Email:</b> {user?.email}
      </p>

      {/* Mostrar o editar perfil */}
      {!editMode ? (
        <>
          <p>
            <b>Dirección:</b> {profile?.address || "-"}
          </p>
          <p>
            <b>Fecha Nac.:</b>{" "}
            {profile?.birthdate
              ? new Date(profile.birthdate).toLocaleDateString()
              : "-"}
          </p>
          <p>
            <b>Edad:</b> {profile?.age ?? "-"}
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setEditMode(true)}
          >
            Editar Perfil
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <Input
            label="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={async () => {
                if (!user) return;
                const bd = birthdate ? new Date(birthdate) : undefined;
                await updateUserProfile(user.uid, {
                  address,
                  birthdate: bd,
                });
                const snap = await getDoc(
                  doc(db, "UserInformation", user.uid)
                );
                setProfile(snap.data() as any);
                setEditMode(false);
              }}
            >
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {/* Métodos de vinculación */}
        {!userHasGoogle && (
          <Button
            variant="google"
            className="mt-2"
            onClick={linkWithGoogle}
            isLoading={isLoading}
          >
            Add Google Sign In
          </Button>
        )}
        {!userHasFacebook && (
          <Button
            variant="facebook"
            className="mt-2"
            onClick={linkWithFacebook}
            isLoading={isLoading}
          >
            Add Facebook Sign In
          </Button>
        )}
        {!userHasPassword && (
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => setShowLinkModal(true)}
            disabled={isLoading}
          >
            Add Email Sign In
          </Button>
        )}
      </div>

      <div className="mt-4">
        <Button variant="primary" onClick={logout} isLoading={isLoading}>
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
