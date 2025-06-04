import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Đăng nhập</h4>
            </div>
            <div className="card-body">
              <LoginForm />
              <hr className="my-4" />
              <div className="text-center">
                <p>Chưa có tài khoản?</p>
                <Link to="/register" className="btn btn-outline-primary">
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;