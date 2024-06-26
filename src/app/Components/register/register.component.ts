import { Component ,NgZone} from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormControlOptions, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { response } from 'express';
declare var gapi: any;
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData: any = {
    userName: '',
    password: '',
    email: '',
    accountType:'donner'
  };
  msgError: string = '';
  isLoading: boolean = false;
  constructor(private _AuthService: AuthService, private _Router: Router,private _ngZone: NgZone) { }
  registerForm: FormGroup = new FormGroup({
    userName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    // confirmEmail: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[\d])(?=.*[!@#$%^&*()_+\-=\[\]{}|;':"\\,.<>\/?]).{6,20}$/)]),
   // rePassword: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[\d])(?=.*[!@#$%^&*()_+\-=\[\]{}|;':"\\,.<>\/?]).{6,20}$/)])
   accountType:new FormControl('')
  },{validators:[this.confirmPassword,this.confirmEmail]} as FormControlOptions );


  confirmPassword(group: FormGroup): void {
    let password = group.get('password');
    let rePassword = group.get('rePassword');
    if(rePassword?.value == ' ')
      {
        rePassword?.setErrors({required:true});
      }
    else if(password?.value != rePassword?.value){
      rePassword?.setErrors({mismatch:true});
    }
  }


  confirmEmail(group: FormGroup): void {
    let email = group.get('email');
    let confirmEmail = group.get('confirmEmail');
    if(confirmEmail?.value == ' ')
      {
        confirmEmail?.setErrors({required:true});
      }
    else if(email?.value != confirmEmail?.value){
      confirmEmail?.setErrors({mismatch:true});
    }
  }

  handleForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      console.log(this.registerForm.value);
      this._AuthService.setRegister(this.userData).subscribe({
        next: (response) => {
          console.log(response)
          this.isLoading = false;
          if(response.isPass==true)
            {
              this._Router.navigate(['/login']);
            }
            
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if(err.status==400)
            {
              this.msgError = err.error.message.errors[0].errorMessage;
            }
         console.log(err);
        }
      });
      
    }
    
    else {
      this.registerForm.markAllAsTouched();
    }
  }





  initializeGoogleSignIn(): void {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: 'YOUR_GOOGLE_CLIENT_ID'
      });
    });
  }

  handleGoogleSignIn(): void {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then((googleUser: any) => {
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;

      const user = {
        name: profile.getName(),
        email: profile.getEmail(),
        token: idToken
      };

      this._ngZone.run(() => {
        this.isLoading = true;
        this._AuthService.setRegister(user).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.message == 'success') {
              this._Router.navigate(['/login']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = err.error.message;
          }
        });
      });
    });
  }
}
