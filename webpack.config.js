var path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');



module.exports = {
  stats: {
    errorDetails: true,
  },
    watch: true, // 변경 사항을 감지하여 자동으로 재빌드
    mode: 'development',
    context: path.resolve(__dirname, 'src/main/react'),
    entry: {
        main: './Main.js', //여러페이지 설정이 가능함
        user: './User/User/User.js',
        userMain: './User/User/UserMain.js',
        adminmain: './Admin/AdminMain.js',
        StoreSignUp: './Admin/StoreSignUp.js',
        AdminLogin: './Admin/AdminLogin.js',
        AdminStoreInfo: './Admin/AdminStoreInfo.js',
        adminReservation : './Admin/AdminReservation.js',
        payment: './User/Payment/Payment.js',
        paymentInfo: './User/Payment/PaymentInfo.js',
        UserChatRoom : './User/Inquiry/UserChatRoom.js',
        master: './Master/Master.js',
        masterStore: './Master/MasterStore.js',
        masterApproval: './Master/MasterApproval.js',
        adminReserveSetting : './Admin/AdminReserveSetting.js',
        adminReserveSettingDetail : './Admin/AdminReserveSettingDetail.js',
        AdminReserveSettingDetailModify : './Admin/AdminReserveSettingDetailModify.js',
        adminReserveManage : './Admin/AdminReserveManage.js',
        adminReserveManageDetail : './Admin/AdminReserveManageDetail.js',
        UserMyReservationList : './User/Reservation/UserMyReservationList.js',
        UserReservationConfirm : './User/Reservation/UserReservationConfirm.js',
        UserReservationComplete : './User/Reservation/UserReservationComplete.js',
/*        UserStoreDetailService : '/User/Store/UserStoreDetailService.js',*/
        UserStoreDetail : './User/Store/UserStoreDetail.js',

         UserReservationOption : './User/Reservation/UserReservationOption.js',
        UserQnaList : './QNA/UserQnaList.js',
        UserQnaRegist : './QNA/UserQnaRegist.js',
        UserSignUp : './User/User/UserSignUp.js',
        UserSignUpFinish : './User/User/UserSignUpFinish.js',
        UserMyPage : './User/User/UserMyPage.js',
        UserLoginPage : './User/User/UserLoginPage.js',
        UserAccountFind : './User/User/UserAccountFind.js',
        UserChatList : './User/Inquiry/UserChatList.js',
        UserReservationDate : './User/Reservation/UserReservationDate.js',
        AdminDelivery : './Admin/AdminDelivery.js',
        UserMyReservationDetail : '/User/Reservation/UserMyReservationDetail.js',
        AdminReserveSettingDetailSlot : '/Admin/AdminReserveSettingDetailSlot.js',
        MyStore: './Admin/MyStore.js',
        StoreDayOff: './Admin/StoreDayOff.js',
        AdminStoreNotice : './Admin/AdminStoreNotice.js',
        AdminStoreNoticeRegist : './Admin/AdminStoreNoticeRegist.js',
        AdminSignupApproval: './Admin/AdminSignupApproval.js',
        AdminStoreReport: './Admin/AdminStoreReport.js',
        UserSearch : './User/User/UserSearch.js',
        UserAccountPage: './User/User/UserAccountPage.js',
        UserDelete: './User/User/UserDelete.js',
        AdminChat: './Admin/AdminChat.js',
        AdminReviewList : './Admin/AdminReviewList.js',
        UserReviewRegist : './User/User/UserReviewRegist.js',
        UserSearchResult: './User/User/UserSearchResult.js',
        AdminAccountFind: './Admin/AdminAccountFind.js',
        AdminStoreNoticeModi : './Admin/AdminStoreNoticeModi.js',
        UserLikeList:'./User/User/UserLikeList.js',
        UserMyReview: './User/User/UserMyReview.js',
        UserAddressPage: './User/User/UserAddressPage.js',

    },

    devtool: 'source-map',
    cache: true,
    output: { //파일이 생성되는 경로
        path: __dirname,
        filename: './src/main/resources/static/bundle/[name].bundle.js'
    },
    module: {
        rules: [
        {
            test: /\.m?js$/, // .mjs 또는 .js 파일을 처리
            resolve: {
                fullySpecified: false // 확장자를 명시하지 않아도 되도록 설정(특히 axios나 다른 모듈에서 발생하는 확장자 문제를 피할 수 있다.)
            }
        },
        {
            test: /\.js?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [ '@babel/preset-env', '@babel/preset-react' ]
                }
            }
        },
        {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },
        {
            test: /\.(png|jpg|jpeg|gif|svg)$/, // 이미지 파일에 대한 규칙
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]', // 파일 이름 설정
                        context: 'src/main/react', // 소스 경로 설정
                    },
                },
            ],
        }
        ]
    },

    plugins: [
        // fix "process is not defined" error:
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),

        // .env 파일 로드
        new Dotenv({
            path: './.env', // .env 파일 경로 설정
            systemvars: true, // 시스템 환경 변수를 가져오기 위해 설정
        }),
      ],
};