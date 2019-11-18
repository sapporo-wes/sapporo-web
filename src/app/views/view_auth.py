# coding: utf-8
from app.forms import AuthenticationFormNoPlaceholder, UserCreationForm
from config.settings import USER_SIGNUP
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.views.generic import CreateView


class SignupView(CreateView):
    raise_exception = True
    form_class = UserCreationForm
    success_url = reverse_lazy("app:signin")
    template_name = "app/signup.html"

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["user_signup"] = USER_SIGNUP

        return context


class LoginNoPlaceholderView(LoginView):
    raise_exception = True
    form_class = AuthenticationFormNoPlaceholder

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["user_signup"] = USER_SIGNUP

        return context
