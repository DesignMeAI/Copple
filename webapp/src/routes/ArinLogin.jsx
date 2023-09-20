import styles from '../styles/ArinLogin.module.css'

function ArinLogin () {
    return (
        <div className={styles.ArinLoginContainer}>
            <div>
                <img src='../assets/copple.svg' />
            </div>
            <div className={styles.ArinLoginContainerWrap}>
                <div className={styles.title}>LOGIN</div>
                <input className={styles.InputID} placeholder='ID'></input>
                <input className={styles.InputPW} placeholder='Password'></input>
                <div className={styles.SectionBar}></div> 
                <div className={styles.FindIdPw}>ID/PW 찾기</div>
                <div className={styles.SocialLogin}>
                    <div className={styles.SocialLoginKakao}></div>
                    <div className={styles.SocialLoginNaver}></div>
                    <div className={styles.SocialLoginGoogle}></div>
                </div>
            </div>
        </div>
    )
}

export default ArinLogin