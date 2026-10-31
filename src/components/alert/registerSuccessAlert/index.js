'use client'
import {Alert, Button, Form, message} from "antd";
const RegisterSuccessAlert = (props) => {

    return <div>
        <Alert
            onClose={() => {
                props.close()
            }}
            message="恭喜您！注册成功！"
            description={
                <>
                    <span>我们已发送了一封验证邮件到您的邮箱，请您及时查收并验证！如果您没有收到邮件，请点击</span>
                    <Button
                        type="link"
                        onClick={async () => {
                            if (props.resend){
                                props.resend()
                            }
                        }}>
                        重新发送邮件
                    </Button>
                </>
            }
            type="success"
            showIcon
            banner
            closable
        />
    </div>
}

export default RegisterSuccessAlert