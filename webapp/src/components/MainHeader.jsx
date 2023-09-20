import styles from "../styles/MainHeader.module.css"
import menubar from '../assets/menubar.svg'
function MainHeader () {
    return (
        <div className={styles.HeaderContainer}>
            <div className={styles.HeaderContainerWrap}>
                <img
                    src={menubar}
                    alt="메뉴바"
                />
            </div>
        </div>
    )
}

export default MainHeader