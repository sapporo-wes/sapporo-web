# coding: utf-8
from app.models import (Run, Service, SupportedWesVersion, Workflow,
                        WorkflowEngine, WorkflowType)
from django.contrib import admin

admin.site.register(Service)
admin.site.register(WorkflowEngine)
admin.site.register(WorkflowType)
admin.site.register(SupportedWesVersion)
admin.site.register(Workflow)
admin.site.register(Run)
