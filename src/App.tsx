import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { getCollection, type Collection } from "./lib/artworks";
import { Layout } from "./components/Layout";
import { CollectionState } from "./components/CollectionState";
import { CollectionPage } from "./pages/CollectionPage";
import { DetailPage } from "./pages/DetailPage";
import { AboutPage } from "./pages/AboutPage";
import "./App.css";

function App() {
  const [collection, setCollection] = useState<Collection>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    getCollection()
      .then((data) => {
        if (current) setCollection(data);
      })
      .catch((reason: unknown) => {
        if (current)
          setError(
            reason instanceof Error
              ? reason.message
              : "Something went wrong. Please try again.",
          );
      });
    return () => {
      current = false;
    };
  }, [attempt]);
  const retry = () => {
    setError(undefined);
    setAttempt((value) => value + 1);
  };
  const pending = <CollectionState error={error} retry={retry} />;
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            collection ? (
              <CollectionPage collection={collection} view="gallery" />
            ) : (
              pending
            )
          }
        />
        <Route
          path="/list"
          element={
            collection ? (
              <CollectionPage collection={collection} view="list" />
            ) : (
              pending
            )
          }
        />
        <Route
          path="/artworks/:id"
          element={
            collection ? <DetailPage collection={collection} /> : pending
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="*"
          element={
            <section className="empty-state shell">
              <p className="eyebrow">A WRONG TURN</p>
              <h1>Let’s find your way back.</h1>
              <Link to="/" className="button">
                Explore the collection
              </Link>
            </section>
          }
        />
      </Routes>
    </Layout>
  );
}
export default App;
