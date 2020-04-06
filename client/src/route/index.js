import VueRouter from 'vue-router';
import Index from '@/components/Index.vue';
import AllCourse from '@/components/AllCourse.vue';
import MyStudentCourse from '@/components/MyStudentCourse.vue';
import MyTeacherCourse from '@/components/MyTeacherCourse.vue';
import SetPeriod from '@/components/SetPeriod.vue';
import ManageUser from '@/components/ManageUser.vue';
import ManageCourse from '@/components/ManageCourse.vue';
import ResourceCenter from '@/components/ResourceCenter.vue';
import ForgetPassword from '@/components/ForgetPassword.vue';
import ManageResource from '@/components/ManageResource.vue';
import ManageStudent from '@/components/ManageStudent.vue';
import Vue from 'vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: '/allCourse',
        component: Index,
        name: 'First'
    },
    { 
        path: '/index',
        name: 'Index',
        component: Index,
        children: [
            {
                name: 'allCourse',
                path: '/allCourse',
                component: AllCourse
            },
            {
                name: 'myStudentCourse',
                path: '/myStudentCourse',
                component: MyStudentCourse
            },
            {
                name: 'myTeacherCourse',
                path: '/myTeacherCourse',
                component: MyTeacherCourse
            },
            {
                name: 'manageUser',
                path: '/manageUser',
                component: ManageUser
            },
            {
                name: 'manageCourse',
                path: '/manageCourse',
                component: ManageCourse
            },
            {
                name: 'setPeriod',
                path: '/setPeriod',
                component: SetPeriod
            },
            {
                name: 'resourceCenter',
                path: '/resourceCenter',
                component: ResourceCenter
            },
            {
                name: 'forgetPassword',
                path: '/forgetPassword',
                component: ForgetPassword
            },
            {
                name: 'manageResource',
                path: '/manageResource',
                component: ManageResource
            },
            {
                name: 'manageStudent',
                path: '/manageStudent',
                component: ManageStudent
            }
        ]
    },
]
  
const router = new VueRouter({
    routes,
    mode: 'hash'
})

export default router