import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(signUpDto: SignUpDto): Promise<{
        message: string;
    }>;
    signIn(signInDto: SignInDto): Promise<{
        access_token: string;
    }>;
}
