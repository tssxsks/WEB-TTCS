import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Đăng ký tài khoản</h4>
            </div>
            <div className="card-body">
              <RegisterForm />
              <hr className="my-4" />
              <div className="text-center">
                <p>Đã có tài khoản?</p>
                <Link to="/login" className="btn btn-outline-primary">
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;