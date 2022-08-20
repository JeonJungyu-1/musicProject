import Link from "next/link";
import Image from "next/future/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Seo from "../../components/Seo";
import axios from "axios";

const CLIENT_ID = "90b84ea4836b42a889af2ed042e1f2d3";
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

const imageStyle = {
  width: "100%",
  height: "100%",
  maxWidth: "100%",
  borderRadius: "12px",
  transition: "transform 0.2s ease-in-out",
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
};

export default function List({ results }) {
  const [token, setToken] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string>("");
  const [artists, setArtists] = useState([]);
  const router = useRouter();
  const onClick = (id: string, title: string) => {
    router.push(`/movies/${title}/${id}`);
  };
  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const searchArtists = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "artist",
      },
    });
    setArtists(data.artists.items);
  };
  return (
    <div className="container">
      <Seo title="Home" />
      <form onSubmit={searchArtists}>
        <input
          type="text"
          onChange={(e) => setSearchKey(e.currentTarget.value)}
        />
        <button type={"submit"}>Search</button>
      </form>
      {artists.map((artist) => (
        <div key={artist.id} className="music">
          {artist.images.length ? (
            <Image
              width={500}
              height={500}
              src={artist.images[0].url}
              alt=""
              style={imageStyle}
            />
          ) : (
            <div
              style={imageStyle}
            >
              No Image
            </div>
          )}
          {artist.name}
        </div>
      ))}
      <style jsx>{`
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 20px;
          gap: 20px;
        }
        .music {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps() {
  const results = await (
    await fetch(`http://localhost:3000/api/movies`)
  ).json();
  return {
    props: {
      results,
    },
  };
}
