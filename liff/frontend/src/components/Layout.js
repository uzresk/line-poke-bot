import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom'
import axios from 'axios'

const liff = window.liff;

const Layout = () => {

    const [userId, setUserId] = useState(null);
    const [displayName, setDisplayName] = useState(null);

    const [pokemon, setPokemon] = useState(null);

    useEffect(() => {
        console.log("use effect.");
        liff.init({
            liffId: ''
        }).then(() => {
            initializeApp()
        }).catch((err) => {
            alert(err);
        })
    });
    const initializeApp = () => {
        if(!liff.isInClient()) {
            alert('LINE内ブラウザで開いてください。');
            // window.close();
        }
        liff.getProfile().then(profile => {
            setUserId(profile.userId);
            setDisplayName(profile.displayName)
        });
    };

    const getProfile = async e => {
        e.preventDefault();
        const result = await axios({
            method: 'GET',
            url: `/api/profile`,
            headers: {
                'accessToken': liff.getAccessToken()
            }
        });
        alert(result.data.displayName);
    };

    const sendMessages = async => {
        liff.sendMessages([{
            type: 'text',
            text: pokemon
        }]).then(()=>{
            alert('message send');
            closeWindow();
        }).catch((err) => {
            alert(err);
        })
    };

    const closeWindow = () => {
        liff.closeWindow();
    };

    return (
        <>
            <div>
                LIFF Sample Application
            </div>
            <hr/>
            <div>
                LIFF SDKで取得
                <div>こんにちは！{displayName}さん。</div>
                <div>userIdは[{userId}]です。</div>
            </div>
            <hr/>
            <button onClick={getProfile}>DisplayNameをAccessTokenからサーバサイドで取得</button>
            <hr/>
            <form>
                <input
                    value={pokemon}
                    onChange={e => setPokemon(e.target.value)}
                    type="text"
                />
                <input onClick={sendMessages} type="submit" value="ポケモンのタイプを調べる"/>
            </form>
            <hr/>
            <Link to="/next">Next Page</Link>
            <hr/>
            <button onClick={closeWindow}>閉じる</button>
        </>
    );
};

export default Layout;
